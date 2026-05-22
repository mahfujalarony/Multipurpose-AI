import { NextResponse } from "next/server";
import { getErrorMessage, getOpenAIClient, textModel } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const contentLabels: Record<string, string> = {
  blog: "SEO blog post",
  landing: "landing page copy",
  social: "social media post",
  meta: "SEO title and meta description",
};

function stripOuterMarkdownFence(output: string) {
  return output.trim().replace(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i, "$1").trim();
}

export async function POST(request: Request) {
  try {
    const { type, tone, topic } = (await request.json()) as {
      type?: string;
      tone?: string;
      topic?: string;
    };

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const rateLimitResponse = enforceRateLimit(request, "ai:text", 20);
    if (rateLimitResponse) return rateLimitResponse;

    const openai = getOpenAIClient();
    const contentType = contentLabels[type || ""] || "content piece";
    const response = await openai.responses.create({
      model: textModel,
      instructions:
        "You are a senior marketing strategist and editor. Create ready-to-use content in clean Markdown. Do not wrap the response in a Markdown code fence. Be specific, practical, and avoid filler.",
      input: `Create a ${contentType} about "${topic.trim()}" in a ${tone || "professional"} tone.`,
      max_output_tokens: type === "blog" ? 1600 : 900,
      store: false,
    });

    return NextResponse.json({ output: stripOuterMarkdownFence(response.output_text) });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
