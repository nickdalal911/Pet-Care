const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// test route
router.get("/", (req, res) => {
  res.json({ message: "Chat working 🚀" });
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Enter a message 🐾" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // const result = await model.generateContent(message);
    const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [{ text: message }],
    },
  ],
});
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    // console.log("🔥 GEMINI ERROR:", error);
    console.log("🔥 FULL ERROR:", error);
console.log("🔥 RESPONSE:", error?.response?.data);
console.log("🔥 MESSAGE:", error.message);
    res.status(500).json({ reply: "AI failed 🐾" });
  }
});

module.exports = router;