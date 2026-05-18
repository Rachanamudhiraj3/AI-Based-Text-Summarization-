import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import summarizeRoutes from "./routes/summarizeRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", summarizeRoutes);
app.get("/", (req, res) => {
  res.send("Server is running ");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});