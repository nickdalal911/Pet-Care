const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Initialize ONCE (outside route)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ TEST ROUTE
router.get("/", (req, res) => {
  res.json({ message: "Chat GET working" });
});

// ✅ MAIN CHAT ROUTE
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please enter a message 🐾" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.log("🔥 GEMINI ERROR:", error);

    res.status(500).json({
      reply: "AI service temporarily unavailable 🐾",
    });
  }
});

module.exports = router;