import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Three vision calls in parallel can be slow; give the function room to finish.
export const maxDuration = 60;

// ---------- Config ----------
// Model names can be overridden from Vercel env vars (no code change needed
// when a provider retires a model). Defaults are the current stable models.
// - Gemini 2.5 Flash is now limited to accounts that already used it (404 for others).
// - gpt-4o dated snapshots shut down on Jan 14, 2027; check OpenAI's deprecations page.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

// Must be lower than maxDuration so we return a clean error instead of being killed.
const REQUEST_TIMEOUT_MS = 55_000;

// ~4M base64 chars is about 3 MB of image, which stays under Vercel's ~4.5 MB body limit.
const MAX_IMAGE_BASE64_CHARS = 4_000_000;
const MAX_PROMPT_CHARS = 4_000;

// Types supported by Claude, Gemini and OpenAI (HEIC/BMP/TIFF are not).
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// ---------- Types ----------
type RequestBody = {
  image?: unknown;
  prompt?: unknown;
  language?: unknown;
};

type ModelResult = { text: string | null; error: string | null };

type ApiErrorShape = { error?: { message?: string } | string };

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

type OpenAIResponse = {
  choices?: { message?: { content?: string | null } }[];
};

type ClaudeResponse = {
  content?: { type?: string; text?: string }[];
};

// ---------- Helpers ----------
async function postJson<T>(
  url: string,
  headers: Record<string, string>,
  payload: unknown,
  label: string
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const data = (await res.json().catch(() => null)) as
    | (T & ApiErrorShape)
    | null;

  if (!res.ok) {
    const apiMessage =
      typeof data?.error === "string" ? data.error : data?.error?.message;
    throw new Error(apiMessage || ${label} failed (HTTP ${res.status}));
  }

  if (!data) {
    throw new Error(${label} returned an invalid response);
  }

  return data;
}

async function safeCall(fn: () => Promise<string>): Promise<ModelResult> {
  try {
    return { text: await fn(), error: null };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      return { text: null, error: "Request timed out." };
    }
    return {
      text: null,
      error: error instanceof Error ? error.message : "AI service error",
    };
  }
}

// ---------- Route ----------
// TODO: add authentication and/or rate limiting here (e.g. check a session,
// or use Upstash Ratelimit). As written, anyone who finds this URL can spend
// your Gemini, OpenAI and Anthropic credits.
export async function POST(req: Request) {
  try {
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { image, prompt, language } = body;

    const isArabic =
      typeof language === "string" && language.toUpperCase() === "AR";

    const fail = (status: number, ar: string, en: string) =>
      NextResponse.json(
        { success: false, error: isArabic ? ar : en },
        { status }
      );

    const systemInstruction = isArabic
      ? "أنت أستاذ ومساعد هندسي خبير. قم بحل المسألة الهندسية خطوة بخطوة، واشرح القوانين المستخدمة، والتعويض بالأرقام، والوحدات، والنتيجة النهائية. لا تتخط أي خطوة."
      : "You are an expert engineering professor. Solve the engineering problem step by step. Explain formulas, substitutions, units, and the final answer. Do not skip steps.";

    // ----- Validate prompt -----
    const trimmedPrompt = typeof prompt === "string" ? prompt.trim() : "";

    if (trimmedPrompt.length > MAX_PROMPT_CHARS) {
      return fail(400, "النص طويل جدًا.", "Prompt is too long.");
    }

    const userText =
      trimmedPrompt ||
      (isArabic
        ? "حل هذه المسألة الهندسية بالتفصيل خطوة بخطوة."
        : "Solve this engineering problem step by step.");

    // ----- Validate image -----
    let imageData: { mimeType: string; base64: string } | null = null;

    if (image) {
      if (typeof image !== "string") {
        return fail(400, "صيغة الصورة غير صحيحة.", "Invalid image format.");
      }

      if (image.length > MAX_IMAGE_BASE64_CHARS + 200) {
        return fail(
          413,
          "الصورة كبيرة جدًا. استخدم صورة أصغر (حتى 3 ميجا تقريبًا).",
          "Image is too large. Please use an image under about 3 MB."
        );
      }

      const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/);

      if (!match) {
        return fail(400, "صيغة الصورة غير صحيحة.", "Invalid image format.");
      }

      const mimeType = match[1].toLowerCase();

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return fail(
          400,
          "نوع الصورة غير مدعوم. استخدم JPEG أو PNG أو WebP أو GIF.",
          "Unsupported image type. Use JPEG, PNG, WebP or GIF."
        );
      }

      imageData = { mimeType, base64: match[2] };
    }

    if (!imageData && !trimmedPrompt) {
      return fail(
        400,
        "أرسل صورة أو اكتب المسألة.",
        "Please send an image or type the problem."
      );
    }

    // ----- Gemini -----
    const callGemini = async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

      const parts: object[] = [];

      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64,
          },
        });
      }

      parts.push({ text: userText });

      const data = await postJson<GeminiResponse>(
        https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent,
        { "x-goog-api-key": apiKey },
        {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts }],
        },
        "Gemini"
      );

      const text = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim();

      if (!text) {
        const reason =
          data.promptFeedback?.blockReason ||
          data.candidates?.[0]?.finishReason;
        throw new Error(
          reason
            ? Gemini returned no text (${reason}).
            : "No Gemini response"
        );
      }

      return text;
    };

    // ----- ChatGPT -----
    const callChatGPT = async () => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

      const content: object[] = [{ type: "text", text: userText }];

      if (imageData) {
        content.push({
          type: "image_url",
          image_url: {
            url: data:${imageData.mimeType};base64,${imageData.base64},
          },
        });
      }

      const data = await postJson<OpenAIResponse>(
        "https://api.openai.com/v1/chat/completions",
        { Authorization: Bearer ${apiKey} },
        {
          model: OPENAI_MODEL,
          // max_tokens is rejected by newer OpenAI models; this works for gpt-4o too.
          max_completion_tokens: 4096,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content },
          ],
        },
        "OpenAI"
      );

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("No ChatGPT response");

      return text;
    };

    // ----- Claude -----
    const callClaude = async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing.");

      const content: object[] = [];

      if (imageData) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: imageData.mimeType,
            data: imageData.base64,
          },
        });
      }

      content.push({ type: "text", text: userText });

      const data = await postJson<ClaudeResponse>(
        "https://api.anthropic.com/v1/messages",
        { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        {
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          system: systemInstruction,
          messages: [{ role: "user", content }],
        },
        "Claude"
      );

      const text = data.content
        ?.filter((part) => part.type === "text")
        .map((part) => part.text ?? "")
        .join("")
        .trim();

      if (!text) throw new Error("No Claude response");

      return text;
    };

    // ----- Run all models independently -----
    const [gemini, chatgpt, claude] = await Promise.all([
      safeCall(callGemini),
      safeCall(callChatGPT),
      safeCall(callClaude),
    ]);

    // gemini / chatgpt / claude stay plain strings so your current UI keeps working.
    // errors tells you which ones failed, so the UI can style them as errors.
    return NextResponse.json({
      success: true,
      gemini: gemini.text ?? gemini.error ?? "",
      chatgpt: chatgpt.text ?? chatgpt.error ?? "",
      claude: claude.text ?? claude.error ?? "",
      errors: {
        gemini: gemini.error,
        chatgpt: chatgpt.error,
        claude: claude.error,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
