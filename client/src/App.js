import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./App.css";

function App() {

  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [bulletPoints, setBulletPoints] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= TEXT SUMMARIZATION =================

  const handleSubmit = async () => {

    try {

      setLoading(true);

      const res = await axios.post(
        "https://ai-based-text-summarization-2sh3.onrender.com/api/summarize",
        {
          text: text,
        }
      );

      setSummary(res.data.summary);
      setBulletPoints(res.data.bulletPoints);
      setKeywords(res.data.keywords);

    } catch (error) {

      console.log(error);
      alert("Failed to summarize text");

    } finally {

      setLoading(false);

    }
  };

  // ================= PDF SUMMARIZATION =================

  const handlePdfUpload = async () => {

    try {

      if (!file) {
        alert("Please select a PDF file");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await axios.post(
        "https://ai-based-text-summarization-2sh3.onrender.com/api/summarize-pdf",
        formData
      );

      setSummary(res.data.summary);
      setBulletPoints(res.data.bulletPoints);
      setKeywords(res.data.keywords);

    } catch (error) {

      console.log(error);
      alert("Failed to summarize PDF");

    } finally {

      setLoading(false);

    }
  };

  // ================= DOWNLOAD PDF =================

  const downloadPDF = () => {

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("AI Summarizer", 20, y);

    y += 20;

    doc.setFontSize(14);
    doc.text("Summary:", 20, y);

    y += 10;

    const summaryLines = doc.splitTextToSize(summary, 170);
    doc.text(summaryLines, 20, y);

    y += summaryLines.length * 8 + 10;

    doc.text("Bullet Points:", 20, y);

    y += 10;

    bulletPoints.forEach((point) => {
      const lines = doc.splitTextToSize(`• ${point}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 8 + 5;
    });

    y += 10;

    doc.text("Keywords:", 20, y);

    y += 10;

    doc.text(keywords.join(", "), 20, y);

    doc.save("summary.pdf");
  };

  // ================= RESET =================

  const resetApp = () => {

    setMode("");
    setText("");
    setSummary("");
    setBulletPoints([]);
    setKeywords([]);
    setFile(null);

  };

  return (

    <div className="container">

      <h1>AI Summarizer</h1>

      {/* ================= SELECT MODE ================= */}

      {mode === "" && (

        <div className="mode-selection">

          <button
            className="card"
            onClick={() => {
              resetApp();
              setMode("text");
            }}
          >
            <h2>Text Summarization</h2>
            <p>Paste text and generate AI summary</p>
          </button>

          <button
            className="card"
            onClick={() => {
              resetApp();
              setMode("pdf");
            }}
          >
            <h2>PDF Summarization</h2>
            <p>Upload PDF and summarize instantly</p>
          </button>

        </div>

      )}

      {/* ================= TEXT MODE ================= */}

      {mode === "text" && (

        <div className="box">

          <button
            className="switch-btn"
            onClick={resetApp}
          >
            ← Back
          </button>

          <h2>Text Summarization</h2>

          <textarea
            rows="10"
            placeholder="Enter text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <br />

          <button
            className="main-btn"
            onClick={handleSubmit}
          >
            {loading ? "Processing..." : "Summarize"}
          </button>

        </div>

      )}

      {/* ================= PDF MODE ================= */}

      {mode === "pdf" && (

        <div className="box">

          <button
            className="switch-btn"
            onClick={resetApp}
          >
            ← Back
          </button>

          <h2>PDF Summarization</h2>

          <div
            className="upload-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              setFile(droppedFile);
            }}
          >

            <p>Drag & Drop PDF Here</p>
            <p>OR</p>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <br />

            {file && (
              <p>
                Selected File: <strong>{file.name}</strong>
              </p>
            )}

            <button
              className="main-btn"
              onClick={handlePdfUpload}
            >
              {loading ? "Processing PDF..." : "Summarize PDF"}
            </button>

          </div>

        </div>

      )}

      {/* ================= RESULTS ================= */}

      {summary && (

        <div className="result-box">

          <h2>Summary</h2>

          <p>{summary}</p>

          <h2>Bullet Points</h2>

          <ul>
            {bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>

          <h2>Keywords</h2>

          <div className="keyword-container">

            {keywords.map((word, index) => (

              <span
                key={index}
                className="keyword"
              >
                {word}
              </span>

            ))}

          </div>

          <button
            className="download-btn"
            onClick={downloadPDF}
          >
            Download Summary PDF
          </button>

        </div>

      )}

    </div>

  );
}

export default App;
