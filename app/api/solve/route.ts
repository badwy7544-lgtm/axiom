import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, prompt, language } = await req.json();

    const systemInstruction =
      language === "AR"
        ? "أنت أستاذ ومساعد هندسي خبير. قم بحل المسألة الهندسية المرفقة خطوة بخطوة بوضوح ودقة، مع ذكر القوانين المستخدمة والوحدات في كل خطوة."
        : "You are an expert engineering professor and assistant. Solve the attached engineering problem step-by-step clearly and accurately, stating formulas and units at each step.";

    const userText =
      prompt?.trim() ||
      (language === "AR"
        ? "حل هذه المسألة الهندسية بالتفصيل خطوة بخطوة."
        : "Solve this engineering problem in detail step-by-step.");

    const imageParts = image ? image.split(",") : [];
    const base64Data = imageParts.length > 1 ? imageParts.at(1) : null;
    const mimeType = image
      ? image.split(";").at(0)?.split(":").at(1) || "image/jpeg"
      : "image/jpeg";

    const callGemini = async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return language === "AR"
          ? "⚠️ مفتاح GEMINI_API_KEY غير مضاف بعد في إعدادات Vercel."
          : "⚠️ GEMINI_API_KEY is not configured in Vercel yet.";
      }

      const parts: object[] = [
        { text: ${systemInstruction}\n\n${userText} },
      ];
      if (base64Data) {
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      }

      const res = await fetch(
        https://googleapis.com{apiKey},
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
        }
      );
      const data = await res.json();
      if (!res.ok) return Gemini Error: ${data.error?.message || "Failed"};
      return data.candidates?.at(0)?.content?.parts?.at(0)?.text || "No response";
    };

    const callChatGPT = async () => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return language === "AR"
          ? "⚠️ مفتاح OPENAI_API_KEY غير مضاف بعد في إعدادات Vercel."
          : "⚠️ OPENAI_API_KEY is not configured in Vercel yet.";
      }

      const content: object[] = [{ type: "text", text: userText }];
      if (image) {
        content.push({ type: "image_url", image_url: { url: image } });
      }

      const res = await fetch("https://openai.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Bearer ${apiKey},
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) return ChatGPT Error: ${data.error?.message || "Failed"};
      return data.choices?.at(0)?.message?.content || "No response";
    };

    const callClaude = async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return language === "AR"
          ? "⚠️ مفتاح ANTHROPIC_API_KEY غير مضاف بعد في إعدادات Vercel."
          : "⚠️ ANTHROPIC_API_KEY is not configured in Vercel yet.";
      }

      const content: object[] = [];
      if (base64Data) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: mimeType, data: base64Data },
        });
      }
      content.push({ type: "text", text: userText });

      const res = await fetch("https://anthropic.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 2048,
          system: systemInstruction,
          messages: [{ role: "user", content }],
        }),
      });
      const data = await res.json();
      if (!res.ok) return Claude Error: ${data.error?.message || "Failed"};
      return data.content?.at(0)?.text || "No response";
    };

    const [gemini, chatgpt, claude] = await Promise.all([
      callGemini(),
      callChatGPT(),
      callClaude(),
    ]);

    return NextResponse.json({ gemini, chatgpt, claude });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
