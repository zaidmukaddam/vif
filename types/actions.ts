import { TodoItem } from ".";
import { Model } from ".";

export type DetermineActionResponse = {
    actions: Array<{
        action: "add" | "delete" | "mark" | "sort" | "edit" | "clear";
        text?: string;
        todoId?: string;
        emoji?: string;
        targetDate?: string;
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