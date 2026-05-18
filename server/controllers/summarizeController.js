import { summarizeWithChunks } from "../services/aiService.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";

const stopWords = [
  "the", "is", "and", "of", "to", "a", "in", "for",
  "on", "with", "as", "by", "an", "at", "from"
];

const generateKeywords = (text) => {

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ");

  const filtered = words.filter(
    word =>
      word.length > 4 &&
      !stopWords.includes(word)
  );

  return [...new Set(filtered)].slice(0, 5);
};

const generateBulletPoints = (summary) => {

  return summary
    .split(". ")
    .filter(point => point.trim() !== "")
    .slice(0, 5);
};

export const summarizeText = async (req, res) => {

  try {

    const { text } = req.body;

    const summary = await summarizeWithChunks(text);

    const bulletPoints = generateBulletPoints(summary);

    const keywords = generateKeywords(summary);

    res.json({
      summary,
      bulletPoints,
      keywords
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Failed to summarize text"
    });
  }
};

export const summarizePDF = async (req, res) => {

  try {

    const pdfText = await extractTextFromPDF(req.file.path);

    const summary = await summarizeWithChunks(pdfText);

    const bulletPoints = generateBulletPoints(summary);

    const keywords = generateKeywords(summary);

    res.json({
      summary,
      bulletPoints,
      keywords
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Failed to summarize PDF"
    });
  }
};