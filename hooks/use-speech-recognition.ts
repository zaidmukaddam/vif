import { useState, useCallback } from 'react';
import { convertSpeechToText } from '@/app/actions';

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);

  // Simplified startRecording function
  const startRecording = async () => {
    // Don't try to record if we're already recording or processing
    if (isRecording || isProcessingSpeech) return;
    
    // Always clean up any existing recorder first
    if (mediaRecorder) {
      try {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      } catch (e) {
        console.error("Error cleaning up previous recorder:", e);
      }
    }
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Find best supported audio format
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', ''];
      let recorder = null;
      
      for (const type of mimeTypes) {
        if (!type || MediaRecorder.isTypeSupported(type)) {
          try {
            recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
            break;
          } catch (e) {
            console.warn(`Failed to create recorder with mime type ${type}:`, e);
          }
        }
      }
      
      if (!recorder) {
        throw new Error("Could not create MediaRecorder with any supported format");
      }
      
      // Set up the new recorder
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      // Set up data handling
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(chunks => [...chunks, e.data]);
        }
      };
      
      // Set up error handling
      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      recorder.start(250); // Collect data in small chunks
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      
      // Show help for denied permission 
      if (error instanceof DOMException && 
          (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")) {
        alert("Microphone access was denied. Please enable microphone access in your browser settings to use voice input.");
      } else {
        // Other type of error
        alert("Could not start recording. Please check your microphone or try a different browser.");
      }
    }
  };

  const stopRecording = useCallback(async () => {
    if (!mediaRecorder || !isRecording) return null;
    
    try {
      // Ensure we've collected some audio data
      if (audioChunks.length === 0) {
        mediaRecorder.requestData();
        // Small delay to allow data to be collected
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Create a promise that will resolve when processing is complete
      const processingPromise = new Promise<string | null>(async (resolve) => {
        // Set up the onstop handler
        mediaRecorder.onstop = async () => {
          try {
            // Process the collected audio
            if (audioChunks.length === 0) {
              console.warn("No audio data collected");
              resolve(null);
              return;
            }
            
            const audioBlob = new Blob(audioChunks, { 
              type: mediaRecorder.mimeType || "audio/webm" 
            });
            
            if (audioBlob.size > 0) {
              setIsProcessingSpeech(true);
              const result = await processSpeechToText(audioBlob);
              resolve(result);
            } else {
              console.warn("Empty audio blob");
              resolve(null);
            }
          } catch (error) {
            console.error("Error processing recording:", error);
            resolve(null);
          } finally {
            setIsProcessingSpeech(false);
          }
        };
      });
      
      // Stop recording
      mediaRecorder.stop();
      
      // Update UI state immediately
      setIsRecording(false);
      
      // Return the promise that will resolve with the text
      return processingPromise;
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      setIsProcessingSpeech(false);
      
      // Clean up tracks if there was an error
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      return null;
    }
  }, [mediaRecorder, isRecording, audioChunks]);

  const processSpeechToText = async (audioBlob: Blob): Promise<string | null> => {
    setIsProcessingSpeech(true);
    
    try {
      console.log("Processing audio:", {
        type: audioBlob.type,
        size: audioBlob.size
      });
      
      // Create a file with the appropriate extension based on MIME type
      let filename = "recording.webm";
      let fileType = audioBlob.type || "audio/webm";
      
      if (fileType.includes("mp4")) {
        filename = "recording.mp4";
      } else if (fileType.includes("ogg")) {
        filename = "recording.ogg";
      } else if (fileType.includes("wav")) {
        filename = "recording.wav";
      }
      
      // Create File object to be serialized over the network
      const audioFile = new File([audioBlob], filename, { 
        type: fileType
      });
      
      console.log("Audio file prepared:", {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size
      });
      
      // Call the server action with the File object
      const text = await convertSpeechToText(audioFile);
      console.log("Got text response:", text);
      
      return text || null;
    } catch (error) {
      console.error("Error converting speech to text:", error);
      alert("Sorry, we couldn't convert your speech to text. Please try again.");
      return null;
    } finally {
      setIsProcessingSpeech(false);
    }
  };

  return {
    isRecording,
    isProcessingSpeech,
    startRecording,
    stopRecording
  };
} 