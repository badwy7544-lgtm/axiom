"use client";

import { useState } from "react";

export default function Home() {
  const [ahmedPhoto, setAhmedPhoto] = useState("/ahmed.jpeg");
  const [esraaPhoto, setEsraaPhoto] = useState("");
  const [language, setLanguage] = useState("EN");

  function uploadPhoto(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <main className="axiom">
      <header className="topbar">
        <a className="brand" href="#">AXIOM<span>.</span></a>
        <nav>
          <a href="#home">Home</a>
          <a href="#workspace">Workspace</a>
          <a href="#developers">Developers</a>
        </nav>
        <button className="lang" onClick={() => setLanguage(language === "EN" ? "AR" : "EN")}>
          {language} ◉
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-symbol">
            A<span className="orbit" />
          </div>
          <h1>AXIOM</h1>
          <p className="subtitle">ENGINEERING INTELLIGENCE</p>
          <p className="tagline">
            Built on your <span>lecture.</span><br />
            Solved by <span>intelligence.</span>
          </p>
          <a href="#workspace" className="primary-btn">Explore AXIOM ↗️</a>
        </div>
        <div className="corner-label">LEARN • SOLVE • EXCEL</div>
      </section>

      <section className="section" id="workspace">
        <div className="section-title">
          <span>01 / WORKSPACE</span>
          <h2>Your Engineering <b>Workspace</b></h2>
          <p>Everything you need to learn, understand and solve.</p>
        </div>

        <div className="tools-grid">
          <article className="tool-card">
            <div className="tool-icon">▤</div>
            <h3>Lecture Library</h3>
            <p>Organize and access your engineering lectures.</p>
          </article>
          <article className="tool-card">
            <div className="tool-icon">PDF</div>
            <h3>PDF Reader</h3>
            <p>Upload your lecture files and prepare them for analysis.</p>
          </article>
          <article className="tool-card">
            <div className="tool-icon">▧</div>
            <h3>Image Questions</h3>
            <p>Prepare question images for AI-powered solving.</p>
          </article>
          <article className="tool-card">
            <div className="tool-icon">✧</div>
            <h3>AI Assistant</h3>
            <p>Ask questions using your lecture as a reference.</p>
          </article>
          <article className="tool-card">
            <div className="tool-icon">∑</div>
            <h3>Step-by-step Solver</h3>
            <p>Understand the solution, one step at a time.</p>
          </article>
          <article className="tool-card">
            <div className="tool-icon">◉</div>
            <h3>Student Account</h3>
            <p>Your personal space for files and saved work.</p>
          </article>
        </div>
      </section>

      <section className="section upload-section">
        <div className="section-title">
          <span>02 / QUICK UPLOAD</span>
          <h2>Bring your <b>Materials</b></h2>
          <p>Select your lecture or question from your device.</p>
        </div>
        <div className="upload-grid">
          <label className="upload-box">
            <span className="upload-symbol">＋</span>
            <strong>Upload Lecture PDF</strong>
            <small>Choose a PDF file from your device</small>
            <input type="file" accept=".pdf,application/pdf"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) alert("Selected: " + file.name + "\nPDF analysis will be connected in the next phase.");
              }} />
            <span className="upload-action">Choose PDF</span>
          </label>
          <label className="upload-box">
            <span className="upload-symbol">＋</span>
            <strong>Upload Question Image</strong>
            <small>Choose an image of your question</small>
            <input type="file" accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) alert("Selected: " + file.name + "\nAI image analysis will be connected in the next phase.");
              }} />
            <span className="upload-action">Choose Image</span>
          </label>
        </div>
      </section>

      <section className="section developers" id="developers">
        <div className="section-title">
          <span>03 / THE TEAM</span>
          <h2>Meet the <b>Developers</b></h2>
          <p>The minds behind AXIOM Engineering Intelligence.</p>
        </div>

        <div className="team-grid">
          <article className="developer-card">
            <div className="photo-frame">
              {ahmedPhoto ? (
                <img src={ahmedPhoto} alt="Ahmed Badwy" />
              ) : (
                <div className="photo-placeholder">AB</div>
              )}
              
            
                
                  
              
            </div>
            <div className="developer-info">
              <h3>Ahmed <b>Badwy</b></h3>
              <p>Founder &amp; Developer</p>
              <small>⚙️ &nbsp; MECHATRONICS ENGINEERING</small>
            </div>
          </article>

          <article className="developer-card">
            <div className="photo-frame">
              {esraaPhoto ? (
                <img src={esraaPhoto} alt="Esraa Selim" />
              ) : (
                <div className="photo-placeholder">ES</div>
              )}
              
                
                
                  
              
            </div>
            <div className="developer-info">
              <h3>Esraa <b>Selim</b></h3>
              <p>Founder &amp; Developer</p>
              <small>⚙️ &nbsp; MECHATRONICS ENGINEERING</small>
            </div>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">AXIOM<span>.</span></div>
        <p>LEARN <b>•</b> SOLVE <b>•</b> EXCEL</p>
        <small>ENGINEERING INTELLIGENCE © 2026</small>
      </footer>
    </main>
  );
}
