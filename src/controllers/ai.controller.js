import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAI = async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Set up chat with history if provided
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error in AI controller:", error);
    res.status(500).json({ message: "AI response failed. Check your API key or connection." });
  }
};

export const analyzeImage = async (req, res) => {
  try {
    const { prompt, image } = req.body; // image as base64 string

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert base64 to parts for Gemini
    const imageParts = [
      {
        inlineData: {
          data: image.split(",")[1], // Remove "data:image/jpeg;base64,"
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt || "Explain this image", ...imageParts]);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error in AI image analysis:", error);
    res.status(500).json({ message: "Image analysis failed." });
  }
};
