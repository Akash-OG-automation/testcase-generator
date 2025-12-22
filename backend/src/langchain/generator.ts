// backend/src/langchain/generator.ts
import { Ollama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { getSystemPrompt } from "../db/schema.js";

// const complexityMap = {
//   low: "llama3:8b",
//   medium: "llama3:70b",
//   high: "mixtral:8x22b",
// } as const;

const complexityMap = {
  low: "phi3:mini",      // Super fast, low RAM
  medium: "llama3:8b",   // Balanced, reliable
  high: "llama3.1:70b",  // Only if you have 48GB+ RAM/GPU
} as const;

type Complexity = keyof typeof complexityMap;

const testCaseSchema = z.object({
  testCaseId: z.string(),
  title: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  expectedResult: z.string(),
});

const outputParser = new StringOutputParser(); // or use structured output later

export async function generateTestCases(
  userStory: string,
  appName: string,
  complexity: Complexity = "medium",
  outputFormat: "text" | "excel" | "pdf" = "text"
) {
  const llm = new Ollama({
    model: complexityMap[complexity],
    temperature: 0.1,
  });

  const systemPrompt = getSystemPrompt(appName);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", `User Story / Change Request:\n\n{userStory}\n\nGenerate detailed test cases including:\n- Test Case ID\n- Title\n- Description\n- Steps (numbered)\n- Expected Result\nCover positive, negative, and edge cases.`],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    llm,
    outputParser,
  ]);

  const rawOutput = await chain.invoke({ userStory });

  // Simple guardrail: ensure output contains test case keywords
  if (!rawOutput.toLowerCase().includes("test case") || !rawOutput.includes("Expected Result")) {
    throw new Error("Generated output does not meet quality standards.");
  }

  // TODO: Use structured output with Zod + LangChain structured parser for better control

  return rawOutput;
}