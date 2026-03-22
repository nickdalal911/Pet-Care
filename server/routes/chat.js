import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {

  console.log("KEY:", process.env.OPENROUTER_API_KEY);
  console.log("✅ CHAT ROUTE HIT");

  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please enter a message 🐾" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful pet care assistant. Give friendly, short, and helpful advice about pets.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response?.data?.choices?.[0]?.message?.content ||
      "No response from AI 🤖";

    res.json({ reply });

  } catch (error) {
    console.log("🔥 OPENROUTER ERROR:", error?.response?.data || error.message);

    res.status(500).json({
      reply: "AI service temporarily unavailable 🐾",
    });
  }
});

export default router;