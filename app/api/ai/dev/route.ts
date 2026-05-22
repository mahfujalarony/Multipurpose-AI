import { NextResponse } from "next/server";
import { getErrorMessage, getOpenAIClient, textModel } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { task, language, mode } = (await request.json()) as {
      task?: string;
      language?: string;
      mode?: string;
    };

    if (!task?.trim()) {
      return NextResponse.json({ error: "Developer task is required." }, { status: 400 });
    }

    const rateLimitResponse = enforceRateLimit(request, "ai:text", 20);
    if (rateLimitResponse) return rateLimitResponse;

    const openai = getOpenAIClient();
    const response = await openai.responses.create({
      model: textModel,
      instructions:
        "You are a senior software engineer. Give practical, production-minded help. Include code when useful, keep explanations concise, and call out assumptions.",
      input: [
        `Mode: ${mode || "Generate code"}`,
        `Language/framework: ${language || "Auto-detect"}`,
        `Task: ${task.trim()}`,
      ].join("\n"),
      max_output_tokens: 1400,
      store: false,
    });

    return NextResponse.json({ output: response.output_text });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
