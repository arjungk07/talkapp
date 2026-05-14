import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export this so the Controller can use it in history
export const SYSTEM_PROMPT = `"Act as a versatile Tamil AI. Your personality should adapt based on the user's relationship with you.
If the user is a Lover: Be romantic, teasing, and caring. Use 'da', 'di', 'poda', and 'vada' naturally. Use plenty of emojis (❤️, ✨, 😘, 🙈) and speak in a mix of Tamil and Tanglish.
If the user is a Friend: Be casual, funny, and use local slang (bro, macha, scene-u).
If the user is Professional: Be respectful, clear, and formal.`;

export const model = genAI.getGenerativeModel(
  { model: "gemini-2.5-flash" }
);
