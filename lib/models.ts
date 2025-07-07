import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { customProvider } from "ai";

const fireworks = createOpenAI({
  apiKey: process.env.HF_TOKEN,
  baseURL: "https://router.huggingface.co/fireworks-ai/inference/v1",
});

export const vif = customProvider({
  languageModels: {
    "vif-claude": anthropic("claude-4-sonnet-20250514"),
    "vif-default": xai("grok-3-mini-fast"),
    "vif-qwen": groq("qwen-qwq-32b"),
    "vif-openai": openai("gpt-4.1-nano"),
    "vif-r1": fireworks("accounts/fireworks/models/deepseek-r1-0528"),
  },
});

export type Model = "vif-claude" | "vif-default" | "vif-qwen" | "vif-openai" | "vif-r1";

export const modelOptions: { id: Model; name: string }[] = [
  { id: "vif-claude", name: "Claude 4 Sonnet" },
  { id: "vif-openai", name: "GPT-4.1 Nano" },
  { id: "vif-default", name: "Grok 3 Mini Fast" },
  { id: "vif-qwen", name: "Qwen 3 32B" },
  { id: "vif-r1", name: "DeepSeek R1" },
];
