const express = require("express");
const router = express.Router();
const axios = require("axios");

// ✅ TEST ROUTE
router.get("/", (req, res) => {
  res.json({ message: "Chat working 🚀" });
});

// ✅ MAIN CHAT ROUTE
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please enter a message 🐾" });
    }

    // 🔥 Gemini Direct API Call (Stable)

const response = await axios.post(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent",
  {
    contents: [
      {
        parts: [{ text: message }],
      },
    ],
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      key: process.env.GEMINI_API_KEY,
    },
  }
);

    // const response = await axios.post(
    //   "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    //   {
    //     contents: [
    //       {
    //         parts: [{ text: message }],
    //       },
    //     ],
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     params: {
    //       key: process.env.GEMINI_API_KEY,
    //     },
    //   }
    // );

    // ✅ Extract reply safely
    const reply =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI 🤖";

    res.json({ reply });

  } catch (error) {
    console.log("🔥 GEMINI ERROR START 🔥");
    console.log(error?.response?.data || error.message);
    console.log("🔥 GEMINI ERROR END 🔥");

    res.status(500).json({
      reply: "AI service temporarily unavailable 🐾",
    });
  }
});

module.exports = router;