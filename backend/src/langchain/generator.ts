import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getSystemPrompt } from '../db/schema.js';

const complexityMap = {
  low: "llama3:8b",      // Use working model for all to avoid 500 errors
  medium: "llama3:8b",
  high: "llama3:8b",
} as const;

type Complexity = keyof typeof complexityMap;

export async function generateTestCases(
  userStory: string,
  appName: string,
  complexity: Complexity = "medium"
) {
  console.log(`Starting generation for app: ${appName}, complexity: ${complexity}, model: ${complexityMap[complexity]}`);
  console.log(`User Story: ${userStory}`);

  const llm = new ChatOllama({
    model: complexityMap[complexity],
    temperature: 0.2,
  });

  const systemPrompt = getSystemPrompt(appName);
  console.log(`System Prompt loaded (length: ${systemPrompt.length})`);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `${systemPrompt}

Generate comprehensive test cases for the following user story or change request.
Requirements:
- Include Test Case ID (e.g., TC001)
- Title
- Preconditions
- Steps (numbered)
- Expected Result
- Cover positive, negative, boundary, and error scenarios
- Use clear formatting with headings and bullet points`],
    ["human", "{userStory}"],
  ]);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  try {
    const result = await chain.invoke(
      { userStory },
      { timeout: 300000 }  // 5 minutes timeout here
    );
    console.log(`Generation complete. Output length: ${result.length} characters`);
    
    if (!result.toLowerCase().includes("test case") && !result.toLowerCase().includes("tc0")) {
      throw new Error("Generated output does not appear to contain valid test cases.");
    }
    
    return result;
  } catch (error: any) {
    console.error(`Error during generation: ${error.message || error}`);
    throw error;
  }
}