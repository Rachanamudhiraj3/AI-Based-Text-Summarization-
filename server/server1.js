import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📁 file upload setup
const upload = multer({ dest: "uploads/" });

// ✅ Test route
app.get("/", (req, res) => {
res.send("Server is running 🚀");
});

// 🔹 TEXT SUMMARIZATION
app.post("/summarize", async (req, res) => {
console.log("Text summarize request");

try {
const { text } = req.body;


if (!text) {
  return res.status(400).json({ error: "Text is required" });
}

const response = await axios.post(
  "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
  {
    inputs: text.substring(0, 2000),
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    },
  }
);

res.json({
  summary: response.data[0]?.summary_text || "No summary generated",
});


} catch (error) {
console.error("TEXT ERROR:", error.response?.data || error.message);


res.status(500).json({
  error: "Text summarization failed",
});


}
});

// 🔥 PDF SUMMARIZATION (NEW)
app.post("/summarize-pdf", upload.single("file"), async (req, res) => {
console.log("PDF summarize request");

try {
const filePath = req.file.path;


// 📄 read PDF
const dataBuffer = fs.readFileSync(filePath);
const pdfData = await pdfParse(dataBuffer);

const text = pdfData.text.substring(0, 1000);

const response = await axios.post(
  "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
  {
    inputs: text,
    parameters: {
      max_length: 200,
      min_length: 80
    }
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    },
  }
);

// 🧹 delete uploaded file
fs.unlinkSync(filePath);

res.json({
  summary: response.data[0]?.summary_text || "No summary generated",
});


} catch (error) {
console.error("PDF ERROR:", error.response?.data || error.message);


res.status(500).json({
  error: "PDF summarization failed",
});


}
});

// 🚀 start server
app.listen(5000, () => {
console.log("Server running on http://localhost:5000");
});









import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📁 file upload
const upload = multer({ dest: "uploads/" });

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// ================= TEXT SUMMARIZATION =================
app.post("/summarize", async (req, res) => {
  console.log("Text summarize request");

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    console.log("Text length:", text.length);

    const chunkSize = 1000;
    const maxChunks = 5; // 🔥 limit API calls
    let summaries = [];

    for (let i = 0; i < text.length && summaries.length < maxChunks; i += chunkSize) {
      console.log("Processing chunk:", summaries.length + 1);

      const chunk = text.substring(i, i + chunkSize);

      const response = await axios.post(
        "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
        {
          inputs: chunk,
          parameters: {
            max_length: 120,
            min_length: 50
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
        }
      );

      summaries.push(response.data[0]?.summary_text);
    }

    const finalSummary = summaries.join(" ");

    res.json({ summary: finalSummary });

  } catch (error) {
    console.error("TEXT ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Text summarization failed",
    });
  }
});


// ================= PDF SUMMARIZATION =================
app.post("/summarize-pdf", upload.single("file"), async (req, res) => {
  console.log("PDF summarize request");

  try {
    const filePath = req.file.path;

    // 📄 read PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text;

    console.log("PDF text length:", text.length);

    const chunkSize = 1000;
    const maxChunks = 5; // 🔥 limit API calls
    let summaries = [];

    for (let i = 0; i < text.length && summaries.length < maxChunks; i += chunkSize) {
      console.log("Processing chunk:", summaries.length + 1);

      const chunk = text.substring(i, i + chunkSize);

      const response = await axios.post(
        "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
        {
          inputs: chunk,
          parameters: {
            max_length: 120,
            min_length: 50
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
        }
      );

      summaries.push(response.data[0]?.summary_text);
    }

    const finalSummary = summaries.join(" ");

    // 🧹 delete file
    fs.unlinkSync(filePath);

    res.json({ summary: finalSummary });

  } catch (error) {
    console.error("PDF ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "PDF summarization failed",
    });
  }
});


// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});