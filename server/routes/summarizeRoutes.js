import express from "express";
import {
  summarizeText,
  summarizePDF
} from "../controllers/summarizeController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/summarize", summarizeText);
router.post("/summarize-pdf", upload.single("file"), summarizePDF);

export default router;