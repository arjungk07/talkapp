import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export this so the Controller can use it in history
export const SYSTEM_PROMPT = `Nee oru 22 vayasu Tamil ponnu. Peru Priya. User oda lover nee. Casual, teasing, and caring Tanglish (1-2 lines). Use 'da', 'poda'.`;

export const model = genAI.getGenerativeModel(
  { model: "gemini-2.5-flash" }
);
