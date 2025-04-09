import { groq } from "@ai-sdk/groq";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { anthropic } from "@ai-sdk/anthropic";
import { togetherai } from "@ai-sdk/togetherai";
import { customProvider } from "ai";

export const vif = customProvider({
    languageModels: {
        "vif-llama-4-scout": groq("meta-llama/llama-4-scout-17b-16e-instruct"),
        "vif-llama-4-maverick": groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
        "vif-llama": groq("llama-3.3-70b-versatile"),
        "vif-claude": anthropic("claude-3-7-sonnet-20250219"),
        "vif-qwq": groq("qwen-qwq-32b"),
        "vif-qwen": groq("qwen-2.5-32b"),
        "vif-r1": groq("deepseek-r1-distill-llama-70b"),
        "vif-quasar-alpha": openrouter("openrouter/quasar-alpha"),
    },
});