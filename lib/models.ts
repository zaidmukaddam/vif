import { groq } from "@ai-sdk/groq";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import { customProvider } from "ai";
import { Model } from "@/types";

export const vif = customProvider({
    languageModels: {
        "vif-llama-4-scout": groq("meta-llama/llama-4-scout-17b-16e-instruct"),
        "vif-llama-4-maverick": groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
        "vif-llama": groq("llama-3.3-70b-versatile"),
        "vif-claude": anthropic("claude-3-7-sonnet-20250219"),
        "vif-grok-3": xai("grok-3-fast-beta"),
        "vif-qwq": groq("qwen-qwq-32b"),
        "vif-qwen": groq("qwen-2.5-32b"),
        "vif-r1": groq("deepseek-r1-distill-llama-70b"),
        "vif-optimus-alpha": openrouter("openrouter/optimus-alpha"),
    },
});

export const modelOptions: { id: Model; name: string }[] = [
    { id: "vif-llama-4-scout", name: "Llama 4 Scout" },
    { id: "vif-llama-4-maverick", name: "Llama 4 Maverick" },
    { id: "vif-llama", name: "Llama 3.3 70B" },
    { id: "vif-claude", name: "Claude 3.7 Sonnet" },
    { id: "vif-grok-3", name: "Grok 3" },
    { id: "vif-qwq", name: "Qwen QWQ 32B" },
    { id: "vif-qwen", name: "Qwen 2.5 32B" },
    { id: "vif-r1", name: "DeepSeek R1 70B" },
    { id: "vif-optimus-alpha", name: "Optimus Alpha" },
];