import { TodoItem } from ".";
import { Model } from "@/lib/models";

export type DetermineActionResponse = {
    actions: Array<{
        action: "add" | "delete" | "mark" | "sort" | "edit" | "clear";
        text?: string;
        todoId?: string;
        emoji?: string;
        targetDate?: string;
        time?: string; // Optional time in HH:mm format
        sortBy?: "newest" | "oldest" | "alphabetical" | "completed";
        status?: "complete" | "incomplete";
        listToClear?: "all" | "completed" | "incomplete";
    }>;
};

export type DetermineActionFn = (
    text: string,
    emoji?: string,
    todos?: TodoItem[],
    model?: Model,
    timezone?: string
) => Promise<DetermineActionResponse>; 