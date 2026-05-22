import OpenAI from "openai";

export const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";
export const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong while generating the output.";
}
