import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { image, prompt, language } = body;

    const isArabic = language === "AR";

    const systemInstruction = isArabic
      ? "أنت أستاذ ومساعد هندسي خبير. قم بحل المسألة الهندسية خطوة بخطوة، واشرح القوانين المستخدمة، والتعويض بالأرقام، والوحدات، والنتيجة النهائية. لا تتخط أي خطوة."
      : "You are an expert engineering professor. Solve the engineering problem step by step. Explain formulas, substitutions, units, and the final answer. Do not skip steps.";

    const userText =
      typeof prompt === "string" && prompt.trim()
        ? prompt.trim()
        : isArabic
          ? "حل هذه المسألة الهندسية بالتفصيل خطوة بخطوة."
          : "Solve this engineering problem step by step.";

    // Extract image data
    const imageMatch =
      typeof image === "string"
        ? image.match(/^data:(image\/[^;]+);base64,(.+)$/)
        : null;

    const base64Data = imageMatch?.[2] || null;
    const mimeType = imageMatch?.[1] || "image/jpeg";

    // Gemini
    const callGemini = async () => {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return "GEMINI_API_KEY is missing.";
      }

      const parts: object[] = [
        { text: ${systemInstruction}\n\n${userText} },
      ];

      if (base64Data) {
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts }],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Gemini failed");
      }

      return (
        data.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("\n") || "No Gemini response"
      );
    };

    // ChatGPT
    const callChatGPT = async () => {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return "OPENAI_API_KEY is missing.";
      }

      const content: object[] = [
        { type: "text", text: userText },
      ];

      if (image) {
        content.push({
          type: "image_url",
          image_url: { url: image },
        });
      }

      const res = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: Bearer ${apiKey},
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemInstruction,
              },
              {
                role: "user",
                content,
              },
            ],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "OpenAI failed");
      }

      return (
        data.choices?.[0]?.message?.content ||
        "No ChatGPT response"
      );
    };

    // Claude
    const callClaude = async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return "ANTHROPIC_API_KEY is missing.";
      }

      const content: object[] = [];

      if (base64Data) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType,
            data: base64Data,
          },
        });
      }

      content.push({
        type: "text",
        text: userText,
      });

      const res = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 4096,
            system: systemInstruction,
            messages: [
              {
                role: "user",
                content,
              },
            ],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Claude failed");
      }

      return (
        data.content
          ?.map((part: { text?: string }) => part.text || "")
          .join("\n") || "No Claude response"
      );
    };

    // Run all AI models independently
    const safeCall = async (fn: () => Promise<string>) => {
      try {
        return await fn();
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "AI service error";
      }
    };

    const [gemini, chatgpt, claude] = await Promise.all([
      safeCall(callGemini),
      safeCall(callChatGPT),
      safeCall(callClaude),
    ]);

    return NextResponse.json({
      success: true,
      gemini,
      chatgpt,
      claude,
    });

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
