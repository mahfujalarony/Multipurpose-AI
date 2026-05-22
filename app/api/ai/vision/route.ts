import { NextResponse } from "next/server";
import { getErrorMessage, getOpenAIClient, imageModel } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getImageSize(model: string, ratio?: string) {
  if (model.startsWith("dall-e-2")) {
    return "1024x1024" as const;
  }

  if (model.startsWith("dall-e-3")) {
    if (ratio === "9:16") return "1024x1792" as const;
    if (ratio === "16:9" || ratio === "4:3") return "1792x1024" as const;
    return "1024x1024" as const;
  }

  if (ratio === "9:16") return "1024x1536" as const;
  if (ratio === "16:9" || ratio === "4:3") return "1536x1024" as const;
  return "1024x1024" as const;
}

function getImageQuality(model: string, quality?: string) {
  if (model.startsWith("dall-e-2")) {
    return undefined;
  }

  if (model.startsWith("dall-e-3")) {
    return quality === "hd" ? ("hd" as const) : ("standard" as const);
  }

  if (quality === "draft") return "low" as const;
  if (quality === "hd") return "high" as const;
  return "medium" as const;
}

export async function POST(request: Request) {
  try {
    const { prompt, style, ratio, quality, count } = (await request.json()) as {
      prompt?: string;
      style?: string;
      ratio?: string;
      quality?: string;
      count?: number;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Image prompt is required." }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(Number(count) || 1, 1), 3);
    const rateLimitResponse = enforceRateLimit(request, "ai:image", 3, safeCount);
    if (rateLimitResponse) return rateLimitResponse;

    const openai = getOpenAIClient();

    const imagePrompt = [
      prompt.trim(),
      `Visual style: ${style || "photorealistic"}.`,
      `Aspect ratio: ${ratio || "16:9"}.`,
      `Quality target: ${quality || "standard"}.`,
      "Create a polished, commercial-ready image. Avoid watermarks, logos, and unreadable text.",
    ].join(" ");

    const responses = await Promise.all(
      Array.from({ length: safeCount }).map(() =>
        openai.images.generate({
          model: imageModel,
          prompt: imagePrompt,
          n: 1,
          size: getImageSize(imageModel, ratio),
          quality: getImageQuality(imageModel, quality),
        }),
      ),
    );

    const images = responses.flatMap((response) =>
      (response.data || []).flatMap((image) => {
        if (image.b64_json) return [`data:image/png;base64,${image.b64_json}`];
        if (image.url) return [image.url];
        return [];
      }),
    );

    if (images.length === 0) {
      return NextResponse.json({ error: "OpenAI did not return an image." }, { status: 502 });
    }

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
