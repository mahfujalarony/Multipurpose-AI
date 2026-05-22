import { NextResponse } from "next/server";
import { getErrorMessage, getOpenAIClient, textModel } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { template, tone, subject, body } = (await request.json()) as {
      template?: string;
      tone?: string;
      subject?: string;
      body?: string;
    };

    if (!body?.trim()) {
      return NextResponse.json({ error: "Email prompt is required." }, { status: 400 });
    }

    const rateLimitResponse = enforceRateLimit(request, "ai:text", 20);
    if (rateLimitResponse) return rateLimitResponse;

    const openai = getOpenAIClient();
    const response = await openai.responses.create({
      model: textModel,
      instructions:
        "You are an expert email copywriter. Write polished, usable emails. Return only the final email with a subject line, greeting, body, and sign-off.",
      input: [
        `Template type: ${template || "general"}`,
        `Tone: ${tone || "Professional"}`,
        `Requested subject: ${subject?.trim() || "Create a strong subject line"}`,
        `User brief: ${body.trim()}`,
      ].join("\n"),
      max_output_tokens: 900,
      store: false,
    });

    return NextResponse.json({ output: response.output_text });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
