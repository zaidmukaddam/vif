import { useState, useEffect } from "react";

export type MicrophonePermissionState = "checking" | "granted" | "denied" | "prompt";

export function useMicrophonePermission() {
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>("checking");

  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        // Check if NavigatorUserMedia API is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log("NavigatorUserMedia not supported");
          setPermissionState("denied");
          return;
        }

        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setPermissionState(result.state as MicrophonePermissionState);

            // Listen for permission changes
            result.onchange = () => {
              setPermissionState(result.state as MicrophonePermissionState);
            };
          } catch (err) {
            console.log("Permission query not supported, will check directly");
            // Use fallback approach - try to access the mic
            checkDirectAccess();
          }
        } else {
          // Fallback for browsers without permissions API
          checkDirectAccess();
        }
      } catch (error) {
        console.error("Error checking mic permission:", error);
        setPermissionState("prompt"); // Assume prompt state if we can't determine
      }
    };

    // Directly attempt to get microphone access to determine state
    const checkDirectAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionState("granted");
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setPermissionState("denied");
        } else {
          setPermissionState("prompt");
        }
      }
    };

    // Run the check
    checkMicPermission();
  }, []);

  return permissionState;
} 