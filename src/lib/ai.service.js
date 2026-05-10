import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateAiResponse = async (prompt, history = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "AI Assistant: Please configure GEMINI_API_KEY to enable AI chat.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert history to Gemini format if needed, for now just simple prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in generateAiResponse:", error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
};
