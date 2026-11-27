"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

type Language = "EN" | "AR";
type Engine = "gemini" | "chatgpt" | "claude";

type Solutions = {
  gemini: string;
  chatgpt: string;
  claude: string;
};

const content = {
  EN: {
    nav: ["Home", "Workspace", "Developers"],
    hero: {
      subtitle: "ENGINEERING INTELLIGENCE",
      line1: "Built on your",
      lecture: "lecture.",
      line2: "Solved by",
      intelligence: "intelligence.",
      cta: "Explore AXIOM ↗️",
      corner: "LEARN • SOLVE • EXCEL",
    },
    workspace: {
      tag: "01 / WORKSPACE",
      title: "Your Engineering",
      bold: "Workspace",
      desc: "Everything you need to learn, understand and solve.",
      tools: [
        ["▤", "Lecture Library", "Organize and access your engineering lectures."],
        ["PDF", "PDF Reader", "Upload lectures and prepare them for analysis."],
        ["▧", "Image Questions", "Prepare question images for AI solving."],
        ["✧", "AI Assistant", "Ask questions using your lecture as a reference."],
        ["∑", "Step-by-step Solver", "Understand every solution step by step."],
        ["◉", "Student Account", "Your personal space for files and saved work."],
      ],
    },
    upload: {
      tag: "02 / TRIPLE-AI SOLVER",
      title: "Solve with",
      bold: "Gemini • ChatGPT • Claude",
      desc: "Upload a question image or type your engineering problem below.",
      pdfTitle: "Upload Lecture PDF",
      pdfSub: "Choose a PDF file from your device",
      pdfBtn: "Choose PDF",
      imgTitle: "Upload Question Image",
      imgSub: "Choose an image of your question",
      imgBtn: "Choose Image",
      change: "Change",
      remove: "Remove",
      ready: "Attached & Ready",
      placeholder: "Write your question or extra instructions here...",
      solve: "Solve with 3 AI Engines ✧",
      solving: "Analyzing with Gemini, ChatGPT & Claude...",
      warning: "Please upload a question image or write a question first.",
      pdfError: "Please select a valid PDF file.",
      imageError: "Please select a valid image.",
      fileError: "File size is too large.",
      error: "Something went wrong. Please try again.",
      results: "AI SOLUTIONS",
      empty: "Your solutions will appear here.",
    },
    team: {
      tag: "03 / THE TEAM",
      title: "Meet the",
      bold: "Developers",
      desc: "The minds behind AXIOM Engineering Intelligence.",
      role: "Founder & Developer",
      major: "MECHATRONICS ENGINEERING",
    },
    footer: "LEARN • SOLVE • EXCEL",
  },

  AR: {
    nav: ["الرئيسية", "مساحة العمل", "المطورون"],
    hero: {
      subtitle: "الذكاء الهندسي",
      line1: "مبني على",
      lecture: "محاضراتك.",
      line2: "ومحلول بواسطة",
      intelligence: "الذكاء الاصطناعي.",
      cta: "استكشف AXIOM ↗️",
      corner: "تعلّم • حُلّ • تفوّق",
    },
    workspace: {
      tag: "01 / مساحة العمل",
      title: "مساحتك",
      bold: "الهندسية",
      desc: "كل ما تحتاجه للتعلم والفهم وحل المسائل الهندسية.",
      tools: [
        ["▤", "مكتبة المحاضرات", "نظّم محاضراتك الهندسية وارجع إليها بسهولة."],
        ["PDF", "قارئ ملفات PDF", "ارفع ملفات المحاضرات وجهّزها للتحليل الذكي."],
        ["▧", "أسئلة بالصور", "جهّز صور المسائل ليتم حلها بالذكاء الاصطناعي."],
        ["✧", "المساعد الذكي", "اسأل بالاعتماد على محتوى محاضرتك."],
        ["∑", "الحل خطوة بخطوة", "افهم طريقة الحل بالتفصيل خطوة تلو الأخرى."],
        ["◉", "حساب الطالب", "مساحتك الشخصية لحفظ ملفاتك وأعمالك."],
      ],
    },
    upload: {
      tag: "02 / الحل الذكي الثلاثي",
      title: "حُلّ مسألتك بواسطة",
      bold: "Gemini • ChatGPT • Claude",
      desc: "ارفع صورة المسألة أو اكتب سؤالك الهندسي ليتم حله بالمحركات الثلاثة.",
      pdfTitle: "رفع محاضرة PDF",
      pdfSub: "اختر ملف PDF من جهازك",
      pdfBtn: "اختر ملف PDF",
      imgTitle: "رفع صورة سؤال",
      imgSub: "اختر صورة واضحة للمسألة",
      imgBtn: "اختر صورة",
      change: "تغيير",
      remove: "حذف",
      ready: "تم الإرفاق وجاهز للحل",
      placeholder: "اكتب المسألة أو أي تعليمات إضافية هنا...",
      solve: "حُلّ المسألة بالمحركات الثلاثة ✧",
      solving: "جاري التحليل والحل عبر المحركات الثلاثة...",
      warning: "يرجى رفع صورة المسألة أو كتابة السؤال أولاً.",
      pdfError: "يرجى اختيار ملف PDF صحيح.",
      imageError: "يرجى اختيار صورة صحيحة.",
      fileError: "حجم الملف كبير جداً.",
      error: "حدث خطأ. حاول مرة أخرى.",
      results: "نتائج الذكاء الاصطناعي",
      empty: "ستظهر الحلول هنا.",
    },
    team: {
      tag: "03 / فريق العمل",
      title: "تعرّف على",
      bold: "المطورين",
      desc: "العقول الهندسية خلف منصة AXIOM.",
      role: "مؤسس ومطور",
      major: "هندسة الميكاترونكس",
    },
    footer: "تعلّم • حُلّ • تفوّق",
  },
};

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file"));
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("EN");

  const [pdf, setPdf] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [solutions, setSolutions] = useState<Solutions | null>(null);

  const [activeTab, setActiveTab] =
    useState<Engine>("gemini");

  const pdfInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const t = content[language];
  const isArabic = language === "AR";

  function handlePdfUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError(t.upload.pdfError);
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError(t.upload.fileError);
      e.target.value = "";
      return;
    }

    setPdf(file);
    setError("");
    setSolutions(null);
  }

  function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t.upload.imageError);
      e.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError(t.upload.fileError);
      e.target.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
    setSolutions(null);
  }

  function removePdf() {
    setPdf(null);
    if (pdfInput.current) {
      pdfInput.current.value = "";
    }
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");

    if (imageInput.current) {
      imageInput.current.value = "";
    }
  }

  async function handleSolve() {
    if (!image && !prompt.trim()) {
      setError(t.upload.warning);
      return;
    }

    setLoading(true);
    setError("");
    setSolutions(null);

    try {
      const imageData = image
        ? await readFile(image)
        : null;

      const pdfData = pdf
        ? await readFile(pdf)
        : null;

      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          pdf: pdfData,
          pdfName: pdf?.name || null,
          imageName: image?.name || null,
          prompt: prompt.trim(),
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t.upload.error
        );
      }

      const result: Solutions = {
        gemini: data.gemini || "",
        chatgpt: data.chatgpt || "",
        claude: data.claude || "",
      };

      if (
        !result.gemini &&
        !result.chatgpt &&
        !result.claude
      ) {
        throw new Error(t.upload.error);
      }

      setSolutions(result);

      const firstAvailable: Engine =
        result.gemini
          ? "gemini"
          : result.chatgpt
          ? "chatgpt"
          : "claude";

      setActiveTab(firstAvailable);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.upload.error
      );
    } finally {
      setLoading(false);
    }
  }

  const engines: Engine[] = [
    "gemini",
    "chatgpt",
    "claude",
  ];

  const engineNames: Record<Engine, string> = {
    gemini: "Gemini",
    chatgpt: "ChatGPT",
    claude: "Claude",
  };

  const currentSolution =
    solutions?.[activeTab] || "";

  return (
    <main
      className="axiom"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <header className="topbar">
        <a className="brand" href="#home">
          AXIOM<span>.</span>
        </a>

        <nav>
          <a href="#home">{t.nav[0]}</a>
          <a href="#workspace">{t.nav[1]}</a>
          <a href="#developers">{t.nav[2]}</a>
        </nav>

        <button
          className="lang"
          onClick={() =>
            setLanguage(isArabic ? "EN" : "AR")
          }
        >
          {isArabic ? "EN" : "AR"} ◉
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="hero-symbol">
            A<span className="orbit" />
          </div>

          <h1>AXIOM</h1>

          <p className="subtitle">
            {t.hero.subtitle}
          </p>

          <p className="tagline">
            {t.hero.line1}{" "}
            <span>{t.hero.lecture}</span>
            <br />
            {t.hero.line2}{" "}
            <span>{t.hero.intelligence}</span>
          </p>

          <a
            href="#workspace"
            className="primary-btn"
          >
            {t.hero.cta}
          </a>
        </div>

        <div className="corner-label">
          {t.hero.corner}
        </div>
      </section>

      <section
        className="section"
        id="workspace"
      >
        <div className="section-title">
          <span>{t.workspace.tag}</span>

          <h2>
            {t.workspace.title}{" "}
            <b>{t.workspace.bold}</b>
          </h2>

          <p>{t.workspace.desc}</p>
        </div>

        <div className="tools-grid">
          {t.workspace.tools.map(
            (tool, index) => (
              <article
                className="tool-card"
                key={index}
              >
                <div className="tool-icon">
                  {tool[0]}
                </div>

                <h3>{tool[1]}</h3>
                <p>{tool[2]}</p>
              </article>
            )
          )}
        </div>
      </section>

      <section className="section upload-section">
        <div className="section-title">
          <span>{t.upload.tag}</span>

          <h2>
            {t.upload.title}{" "}
            <b>{t.upload.bold}</b>
          </h2>

          <p>{t.upload.desc}</p>
        </div>

        <div className="upload-grid">

          {/* PDF UPLOAD */}

          <div className="upload-box">
            <span className="upload-symbol">
              {pdf ? "✓" : "＋"}
            </span>

            <strong>
              {pdf
                ? pdf.name
                : t.upload.pdfTitle}
            </strong>

            <small>
              {pdf
                ? t.upload.ready
                : t.upload.pdfSub}
            </small>

            <div className="upload-actions">
              <label
                className="upload-action"
                style={{ cursor: "pointer" }}
              >
                {pdf
                  ? t.upload.change
                  : t.upload.pdfBtn}

                <input
                  ref={pdfInput}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  hidden
                />
              </label>

              {pdf && (
                <button
                  type="button"
                  className="upload-action"
                  onClick={removePdf}
                >
                  {t.upload.remove}
                </button>
              )}
            </div>
          </div>

          {/* IMAGE UPLOAD */}

          <div className="upload-box">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Question Preview"
                className="question-preview"
              />
            ) : (
              <span className="upload-symbol">
                ＋
              </span>
            )}

            <strong>
              {image
                ? image.name
                : t.upload.imgTitle}
            </strong>

            <small>
              {image
                ? t.upload.ready
                : t.upload.imgSub}
            </small>

            <div className="upload-actions">
              <label
                className="upload-action"
                style={{ cursor: "pointer" }}
              >
                {image
                  ? t.upload.change
                  : t.upload.imgBtn}

                <input
                  ref={imageInput}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              {image && (
                <button
                  type="button"
                  className="upload-action"
                  onClick={removeImage}
                >
                  {t.upload.remove}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QUESTION INPUT */}

        <div className="question-area">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError("");
            }}
            placeholder={t.upload.placeholder}
            rows={5}
          />
        </div>

        {/* SOLVE BUTTON */}

        <button
          type="button"
          className="solve-btn"
          onClick={handleSolve}
          disabled={loading}
        >
          {loading
            ? t.upload.solving
            : t.upload.solve}
        </button>

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}
      </section>

      {/* AI RESULTS */}

      {solutions && (
        <section
          className="section results-section"
          id="results"
        >
          <div className="section-title">
            <span>{t.upload.results}</span>
            <h2>
              AXIOM <b>AI Results</b>
            </h2>
          </div>

          <div className="results-tabs">
            {engines.map((engine) => (
              <button
                key={engine}
                type="button"
                className={
                  activeTab === engine
                    ? "result-tab active"
                    : "result-tab"
                }
                disabled={!solutions[engine]}
                onClick={() =>
                  setActiveTab(engine)
                }
              >
                {engineNames[engine]}
              </button>
            ))}
          </div>

          <div className="solution-card">
            <h3>
              {engineNames[activeTab]}
            </h3>

            <div className="solution-content">
              {currentSolution || t.upload.empty}
            </div>
          </div>
        </section>
      )}

     {/* DEVELOPERS */}

      <section
        className="section developers"
        id="developers"
      >
        <div className="section-title">
          <span>{t.team.tag}</span>

          <h2>
            {t.team.title}{" "}
            <b>{t.team.bold}</b>
          </h2>

          <p>{t.team.desc}</p>
        </div>

        <div className="team-grid">
          <article className="developer-card">
            <div className="photo-frame">
              <img src="/ahmed.jpeg" alt="Ahmed Badwy" />
            </div>
            <div className="developer-info">
              <h3>{isArabic ? <>أحمد <b>بدوي</b></> : <>Ahmed <b>Badwy</b></>}</h3>
              <p>{t.team.role}</p>
              <small>⚙️ &nbsp; {t.team.major}</small>
            </div>
          </article>

          <article className="developer-card">
            <div className="photo-frame">
              <img src="/esraa.jpeg" alt="Esraa Selim" />
            </div>
            <div className="developer-info">
              <h3>{isArabic ? <>إسراء <b>سليم</b></> : <>Esraa <b>Selim</b></>}</h3>
              <p>{t.team.role}</p>
              <small>⚙️ &nbsp; {t.team.major}</small>
            </div>
          </article>
        </div>
      </section>

      <footer className="footer">
        <a className="brand" href="#home">
          AXIOM<span>.</span>
        </a>

        <p>{t.footer}</p>

        <small>
          © 2026 AXIOM ENGINEERING INTELLIGENCE
        </small>
      </footer>
    </main>
  );
}
