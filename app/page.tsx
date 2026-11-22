"use client";

import { useState } from "react";

const content = {
  EN: {
    nav: { home: "Home", workspace: "Workspace", developers: "Developers" },
    hero: {
      subtitle: "ENGINEERING INTELLIGENCE",
      tagline1: "Built on your",
      lecture: "lecture.",
      tagline2: "Solved by",
      intelligence: "intelligence.",
      cta: "Explore AXIOM ↗️",
      corner: "LEARN • SOLVE • EXCEL",
    },
    workspace: {
      tag: "01 / WORKSPACE",
      title1: "Your Engineering",
      titleBold: "Workspace",
      desc: "Everything you need to learn, understand and solve.",
      tools: [
        { icon: "▤", title: "Lecture Library", desc: "Organize and access your engineering lectures." },
        { icon: "PDF", title: "PDF Reader", desc: "Upload your lecture files and prepare them for analysis." },
        { icon: "▧", title: "Image Questions", desc: "Prepare question images for AI-powered solving." },
        { icon: "✧", title: "AI Assistant", desc: "Ask questions using your lecture as a reference." },
        { icon: "∑", title: "Step-by-step Solver", desc: "Understand the solution, one step at a time." },
        { icon: "◉", title: "Student Account", desc: "Your personal space for files and saved work." },
      ],
    },
    upload: {
      tag: "02 / TRIPLE-AI SOLVER",
      title1: "Solve with",
      titleBold: "Gemini • ChatGPT • Claude",
      desc: "Upload a question image or type your engineering problem below.",
      pdfTitle: "Upload Lecture PDF",
      pdfSub: "Choose a PDF file from your device",
      pdfBtn: "Choose PDF",
      pdfChange: "Change PDF",
      imgTitle: "Upload Question Image",
      imgSub: "Choose an image of your question",
      imgBtn: "Choose Image",
      imgChange: "Change Image",
      remove: "Remove",
      ready: "Attached & Ready",
      promptPlaceholder: "Optional: Write your question or extra instructions here...",
      solveBtn: "Solve with 3 AI Engines ✧",
      solving: "Analyzing with Gemini, ChatGPT & Claude...",
      emptyWarning: "Please upload a question image or write a question first.",
    },
    team: {
      tag: "03 / THE TEAM",
      title1: "Meet the",
      titleBold: "Developers",
      desc: "The minds behind AXIOM Engineering Intelligence.",
      role: "Founder & Developer",
      major: "MECHATRONICS ENGINEERING",
    },
    footer: "LEARN • SOLVE • EXCEL",
  },
  AR: {
    nav: { home: "الرئيسية", workspace: "مساحة العمل", developers: "المطورون" },
    hero: {
      subtitle: "الذكاء الهندسي",
      tagline1: "مبني على",
      lecture: "محاضراتك.",
      tagline2: "ومحلول بواسطة",
      intelligence: "الذكاء الاصطناعي.",
      cta: "استكشف AXIOM ↗️",
      corner: "تعلّم • حُلّ • تفوّق",
    },
    workspace: {
      tag: "01 / مساحة العمل",
      title1: "مساحتك",
      titleBold: "الهندسية",
      desc: "كل ما تحتاجه للتعلم والفهم وحل المسائل الهندسية.",
      tools: [
        { icon: "▤", title: "مكتبة المحاضرات", desc: "نظّم محاضراتك الهندسية وارجع إليها بسهولة." },
        { icon: "PDF", title: "قارئ ملفات PDF", desc: "ارفع ملفات المحاضرات وجهّزها للتحليل الذكي." },
        { icon: "▧", title: "أسئلة بالصور", desc: "جهّز صور المسائل ليتم حلها بالذكاء الاصطناعي." },
        { icon: "✧", title: "المساعد الذكي", desc: "اسأل أي سؤال بالاعتماد على محتوى محاضرتك." },
        { icon: "∑", title: "الحل خطوة بخطوة", desc: "افهم طريقة الحل بالتفصيل خطوة تلو الأخرى." },
        { icon: "◉", title: "حساب الطالب", desc: "مساحتك الشخصية لحفظ ملفاتك وأعمالك." },
      ],
    },
    upload: {
      tag: "02 / الحل الذكي الثلاثي",
      title1: "حُلّ مسألتك بواسطة",
      titleBold: "Gemini • ChatGPT • Claude",
      desc: "ارفع صورة المسألة أو اكتب سؤالك الهندسي ليتم حله بالمحركات الثلاثة معاً.",
      pdfTitle: "رفع محاضرة PDF",
      pdfSub: "اختر ملف PDF من جهازك",
      pdfBtn: "اختر ملف PDF",
      pdfChange: "تغيير الملف",
      imgTitle: "رفع صورة سؤال",
      imgSub: "اختر صورة واضحة للمسألة",
      imgBtn: "اختر صورة",
      imgChange: "تغيير الصورة",
      remove: "حذف",
      ready: "تم الإرفاق وجاهز للحل",
      promptPlaceholder: "اختياري: اكتب نص المسألة أو أي ملاحظات إضافية هنا...",
      solveBtn: "حُلّ المسألة بالمحركات الثلاثة ✧",
      solving: "جاري التحليل والحل عبر Gemini و ChatGPT و Claude...",
      emptyWarning: "يرجى رفع صورة المسألة أو كتابة السؤال أولاً.",
    },
    team: {
      tag: "03 / فريق العمل",
      title1: "تعرّف على",
      titleBold: "المطورين",
      desc: "العقول الهندسية خلف منصة AXIOM.",
      role: "مؤسس ومطور",
      major: "هندسة الميكاترونكس",
    },
    footer: "تعلّم • حُلّ • تفوّق",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<"EN" | "AR">("EN");
  const [pdfName, setPdfName] = useState<string>("");
  const [questionImage, setQuestionImage] = useState<string>("");
  const [questionImageName, setQuestionImageName] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [solutions, setSolutions] = useState<{
    gemini: string;
    chatgpt: string;
    claude: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"gemini" | "chatgpt" | "claude">("gemini");

  const t = content[language];

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfName(file.name);
  }

  function handleQuestionImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuestionImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setQuestionImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSolve() {
    if (!questionImage && !prompt.trim()) {
      alert(t.upload.emptyWarning);
      return;
    }

    setLoading(true);
    setSolutions(null);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: questionImage || null,
          prompt,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Error solving problem");
      } else {
        setSolutions(data);
      }
    } catch {
      alert("Network error while connecting to AI engines.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="axiom" dir={language === "AR" ? "rtl" : "ltr"}>
      <header className="topbar">
        <a className="brand" href="#">AXIOM<span>.</span></a>
        <nav>
          <a href="#home">{t.nav.home}</a>
          <a href="#workspace">{t.nav.workspace}</a>
          <a href="#developers">{t.nav.developers}</a>
        </nav>
        <button className="lang" onClick={() => setLanguage(language === "EN" ? "AR" : "EN")}>
          {language === "EN" ? "AR" : "EN"} ◉
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-symbol">
            A<span className="orbit" />
          </div>
          <h1>AXIOM</h1>
          <p className="subtitle">{t.hero.subtitle}</p>
          <p className="tagline">
            {t.hero.tagline1} <span>{t.hero.lecture}</span><br />
            {t.hero.tagline2} <span>{t.hero.intelligence}</span>
          </p>
          <a href="#workspace" className="primary-btn">{t.hero.cta}</a>
        </div>
        <div className="corner-label">{t.hero.corner}</div>
      </section>

      <section className="section" id="workspace">
        <div className="section-title">
          <span>{t.workspace.tag}</span>
          <h2>{t.workspace.title1} <b>{t.workspace.titleBold}</b></h2>
          <p>{t.workspace.desc}</p>
        </div>

        <div className="tools-grid">
          {t.workspace.tools.map((tool, index) => (
            <article className="tool-card" key={index}>
              <div className="tool-icon">{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section upload-section">
        <div className="section-title">
          <span>{t.upload.tag}</span>
          <h2>{t.upload.title1} <b>{t.upload.titleBold}</b></h2>
          <p>{t.upload.desc}</p>
        </div>

        <div className="upload-grid">
          {/* رفع ملف PDF */}
          <div className="upload-box">
            <span className="upload-symbol">{pdfName ? "✓" : "＋"}</span>
            <strong>{pdfName ? pdfName : t.upload.pdfTitle}</strong>
            <small>{pdfName ? t.upload.ready : t.upload.pdfSub}</small>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <label className="upload-action" style={{ cursor: "pointer" }}>
                {pdfName ? t.upload.pdfChange : t.upload.pdfBtn}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  style={{ display: "none" }}
                />
              </label>

              {pdfName && (
                <button
                  type="button"
                  onClick={() => setPdfName("")}
                  className="upload-action"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", cursor: "pointer" }}
                >
                  {t.upload.remove}
                </button>
              )}
            </div>
          </div>

          {/* رفع صورة سؤال */}
          <div className="upload-box">
            {questionImage ? (
              <img
                src={questionImage}
                alt="Question Preview"
                style={{
                  maxWidth: "100%"
