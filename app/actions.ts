"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { groq } from "@ai-sdk/groq";

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    emoji?: string;
    date: Date;
}

export async function determineAction(text: string, emoji?: string, todos?: TodoItem[]) {
    console.log("Determining action...");
    console.log(text, emoji, todos);
    const startTime = Date.now();
    const { object: action } = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        temperature: 0.5,
        schema: z.object({
            action: z.enum(["add", "delete", "complete", "sort", "edit"]).describe("The action to take"),
            text: z.string().describe("The text of the todo item").optional(),
            emoji: z.string().describe("The emoji of the todo item").optional(),
            sortBy: z.enum(
                ["newest", "oldest", "alphabetical", "completed"]
            ).describe("The sort order").optional(),
            targetText: z.string().describe("The exact given text of the todo item to edit. do not include the emoji.").optional(),
        }),
        prompt: `
        The user has entered the following text: ${text}
        ${emoji ? `The user has also entered the following emoji: ${emoji}` : ""}
        Determine the action to take based on the given context.

        ${todos ? `The user has the following todos: ${todos?.map(todo => `${todo.text} (${todo.emoji})`).join(", ")}` : ""}
        
        The action should be one of the following: ${["add", "delete", "complete", "sort", "edit"].join(", ")}
        If the action is "add", the text and emoji should be included.
        If the action is "delete", the text should be included.
        If the action is "complete", the text should be included.
        If the action is "sort", the sortBy should be included.
        If the action is "edit", both the targetText (to identify the todo to edit) and the text (the new content) should be included.
        The edit request will mostly be ambiguous, so make the edit as close to the original as possible to maintain the user's context with the todo to edit.

        Some queries will be ambiguous stating the tense of the text, which will allow you to infer the correct action to take on the todo list. 
        The add requests will mostly likey to be in the future tense, while the complete requests will be in the past tense.
        The emojis sent by the user should be prioritized and not changed unless they don't match the todo's intent.
        The todo list is very important to understand the user's intent.
        Example: "todo: 'buy groceries', user request: 'bought groceries', action: 'complete', text: 'buy groceries'"
        Example: "todo: 'make a post with @theo', user request: 'i made a post with @theo', action: 'complete', text: 'make a post with @theo'"
        Example: "request: 'buy groceries', action: 'add', text: 'buy groceries', emoji: '🛒'"

        Example edit requests:
        "original text: 'meeting w/ John', user request: 'i meant meet Jane', edit: 'meeting w/ Jane'"
        "original text: 'buy groceries', user request: 'i meant buy flowers', edit: 'buy flowers'"
        "original text: 'go for violin lesson', user request: 'i meant go for a walk', edit: 'go for a walk'"
        "original text: 'call for bug report', user request: 'i meant call bharat for it', edit: 'call bharat for bug report'"

        ${emoji ? `Change the emoji to a more appropriate based on the text. The current emoji is: ${emoji}` : ""}
        `.trim(),
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Time taken: ${duration}ms`);
    console.log(action);
    return action;
}

export async function convertSpeechToText(audioFile: any) {
    "use server";
    
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
        throw new Error("ElevenLabs API key is not set");
    }
    
    try {
        if (!audioFile) {
            throw new Error("No audio file provided");
        }
        
        console.log("Processing audio file:", {
            type: audioFile.type,
            size: audioFile.size,
            name: audioFile.name || "unnamed"
        });
        
        // Create a FormData to send to ElevenLabs
        const formData = new FormData();
        
        // Add the file directly, no instanceof check needed
        formData.append("file", audioFile);
        formData.append("model_id", "scribe_v1");

        console.log("Sending request to ElevenLabs API...");
        const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
            method: "POST",
            headers: {
                "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            // Try to get more detailed error information
            let errorDetail = "";
            try {
                const errorResponse = await response.text();
                errorDetail = errorResponse;
            } catch (e) {
                errorDetail = "Could not parse error response";
            }
            
            console.error("ElevenLabs API error:", {
                status: response.status,
                statusText: response.statusText,
                detail: errorDetail
            });
            
            throw new Error(`API error: ${response.status} - ${errorDetail}`);
        }

        const data = await response.json();
        console.log("ElevenLabs API response:", data);
        return data.text || "";
    } catch (error) {
        console.error("Error converting speech to text:", error);
        throw error;
    }
}
