import { groq } from "@ai-sdk/groq";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { customProvider } from "ai";

export const vif = customProvider({
    languageModels: {
        "vif-llama": groq("llama-3.3-70b-versatile"),
        "vif-qwq": groq("qwen-qwq-32b"),
        "vif-qwen": groq("qwen-2.5-32b"),
        "vif-r1": groq("deepseek-r1-distill-llama-70b"),
        "vif-quasar-alpha": openrouter("openrouter/quasar-alpha"),
    },
});