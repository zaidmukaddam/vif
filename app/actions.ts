"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { vif } from "@/lib/models";
import { transcribe } from "orate";
import { Groq } from 'orate/groq';
import { DetermineActionFn } from "@/types/actions";

export const determineAction: DetermineActionFn = async (text, emoji, todos, model = "vif-llama", timezone = "UTC") => {
    console.log("Determining action...");
    console.log(text, emoji, todos);
    console.log("Model:", model);
    console.log("Timezone:", timezone);

    // Create dates in the user's timezone
    const today = new Date();
    const todayInTz = new Date(today.toLocaleString("en-US", { timeZone: timezone }));
    const todayStr = todayInTz.toISOString().split('T')[0]; // YYYY-MM-DD format

    const tomorrow = new Date(todayInTz);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log("Today in timezone:", todayStr);
    console.log("Tomorrow in timezone:", tomorrowStr);

    const prompt = `
        Today's date is: ${todayStr} (Timezone: ${timezone})
        The user has entered the following text: ${text}
        ${emoji ? `The user has also entered the following emoji: ${emoji}` : ""}
        Determine the action or multiple actions to take based on the given context.
        Return an array of actions.

        Don't make assumptions about the user's intent, the todo list is very important to understand the user's intent.
        Go through the todo list and make sure to understand the user's intent based on the todo list.
        All the text should be in lowercase!!
        Never add existing todos to the list, only add new todos, but perform actions on existing todos.
        Be very mindful of the user's intent, they may want to add a todo, but they may also want to delete a todo, mark a todo as complete, or edit a todo.
        Take some humor into account, the user may be joking around or being sarcastic.

        The user can specify dates in their commands like:
        - "add buy groceries today" -> targetDate: ${todayStr}
        - "add buy groceries tomorrow" -> targetDate: ${tomorrowStr}
        - "add meeting with John next monday"
        - "add dentist appointment on friday"
        - "add vacation planning for next week"
        - "add homework due in 3 days"
        
        Extract the date from these commands and set it accordingly. If no date is specified, use the currently selected date.
        Parse relative dates like "today", "tomorrow", "next week", "in 3 days", etc.
        For specific days like "monday", "tuesday", etc., use the next occurrence of that day.
        Always return dates in YYYY-MM-DD format.

${todos ? `<todo_list>
${todos?.map(todo => `- ${todo.id}: ${todo.text} (${todo.emoji})`).join("\n")}
</todo_list>` : ""}

        The action should be one of the following: ${["add", "delete", "mark", "sort", "edit", "clear"].join(", ")}
        - If the action is "add", the text, emoji, and targetDate should be included.
        - If the action is "delete", the todoId should be included.
        - If the action is "mark", the todoId should be included and the status should be "complete" or "incomplete".
        - If the action is "sort", the sortBy should be included.
        - If the action is "edit", both the todoId (to identify the todo to edit) and the text (the new content) should be included.
        - If the action is "clear", the user wants to clear the list of todos with the given listToClear(all, completed, incomplete).
        
        For the add action, the text should be in the future tense. like "buy groceries", "make a post with @theo", "go for violin lesson"
        ${emoji ? `Change the emoji to a more appropriate based on the text. The current emoji is: ${emoji}` : ""}
     
        Some queries will be ambiguous stating the tense of the text, which will allow you to infer the correct action to take on the todo list. 
        The add requests will mostly likey to be in the future tense, while the complete requests will be in the past tense.
        The emojis sent by the user should be prioritized and not changed unless they don't match the todo's intent.
        The todo list is very important to understand the user's intent.
        
        IMPORTANT: You must always use the todo's ID for the actions delete, mark, and edit. Do not use the text to identify todos.
        Example: "todo id: '123abc', todo text: 'buy groceries', user request: 'bought groceries', action: 'mark', todoId: '123abc', status: 'complete'"
        Example: "todo id: '456def', todo text: 'make a post with @theo', user request: 'i made a post with @theo', action: 'mark', todoId: '456def', status: 'complete'"
        Example: "request: 'buy groceries today', action: 'add', text: 'buy groceries', emoji: '🛒', targetDate: '${todayStr}'"
        Example: "request: 'buy groceries tomorrow', action: 'add', text: 'buy groceries', emoji: '🛒', targetDate: '${tomorrowStr}'"

        The edit request will mostly be ambiguous, so make the edit as close to the original as possible to maintain the user's context with the todo to edit.
        Some word could be incomplete, like "meet" instead of "meeting", make sure to edit the todo based on the todo list since the todo already exists just needs a rewrite.

        Example edit requests:
        "todo id: '789ghi', original text: 'meeting w/ John', user request: 'i meant meet Jane', action: 'edit', todoId: '789ghi', text: 'meeting w/ Jane'"
        "todo id: '012jkl', original text: 'buy groceries', user request: 'i meant buy flowers', action: 'edit', todoId: '012jkl', text: 'buy flowers'"
        "todo id: '345mno', original text: 'go for violin lesson', user request: 'i meant go for a walk', action: 'edit', todoId: '345mno', text: 'go for a walk'"

        Example clear requests:
        "user request: 'clear all todos', action: 'clear', listToClear: 'all'"
        "user request: 'clear my completed tasks', action: 'clear', listToClear: 'completed'"
        "user request: 'remove all incomplete items', action: 'clear', listToClear: 'incomplete'"
        "user request: 'start fresh', action: 'clear', listToClear: 'all'"
        "user request: 'delete finished tasks', action: 'clear', listToClear: 'completed'"
        "user request: 'clean up my list', action: 'clear', listToClear: 'all'"
    `;

    console.log("prompt", prompt);
    const startTime = Date.now();
    const { object: action, usage } = await generateObject({
        model: vif.languageModel(model),
        temperature: 0,
        providerOptions: {
            groq: {
                "service_tier": "auto",
            }
        },
        schema: z.object({
            actions: z.array(z.object({
                action: z.enum(["add", "delete", "mark", "sort", "edit", "clear",]).describe("The action to take"),
                text: z.string().describe("The text of the todo item").optional(),
                todoId: z.string().describe("The id of the todo item to act upon").optional(),
                emoji: z.string().describe("The emoji of the todo item").optional(),
                targetDate: z.string().describe("The target date for the todo item in YYYY-MM-DD format").optional(),
                sortBy: z.enum(
                    ["newest", "oldest", "alphabetical", "completed"]
                ).describe("The sort order").optional(),
                status: z.enum(["complete", "incomplete"]).describe("The status of the todo item. to be used for the mark action").optional(),
                listToClear: z.enum(["all", "completed", "incomplete"]).describe("The list to clear").optional(),
            })),
        }),
        prompt,
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Time taken: ${duration}ms`);
    console.log(action);
    console.log("usage", usage);
    return action;
}

export async function convertSpeechToText(audioFile: any) {
    "use server";

    if (!audioFile) {
        throw new Error("No audio file provided");
    }

    console.log("Processing audio file:", {
        type: audioFile.type,
        size: audioFile.size,
        name: audioFile.name || "unnamed"
    });

    const text = await transcribe({
        model: new Groq().stt("whisper-large-v3-turbo"),
        audio: audioFile,
    });

    console.log("Transcribed text:", text);
    return text;
}
