const express = require("express");
const router = express.Router();
const axios = require("axios");

const Product = require("../models/Product");
const Service = require("../models/Service");

// ✅ Health check
router.get("/", (req, res) => {
  res.json({ message: "Chat GET working" });
});

// ✅ Chat route
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const msg = message.toLowerCase();

    // =========================
    // 🛒 PRODUCT SEARCH
    // =========================
    if (msg.includes("product") || msg.includes("buy")) {
      const products = await Product.find().limit(5);

      if (products.length > 0) {
        const reply = products
          .map(p => `• ${p.name} - ₹${p.price}`)
          .join("\n");

        return res.json({
          reply: `Here are some products 🛒:\n${reply}`,
        });
      }
    }

    // =========================
    // 🐾 SERVICE SEARCH
    // =========================
    if (msg.includes("service") || msg.includes("vet")) {
      const services = await Service.find().limit(5);

      if (services.length > 0) {
        const reply = services
          .map(s => `• ${s.title} (${s.location})`)
          .join("\n");

        return res.json({
          reply: `Available services 🐾:\n${reply}`,
        });
      }
    }

    // =========================
    // 🧠 CONTEXT FROM DB
    // =========================
    const products = await Product.find().limit(5);
    const services = await Service.find().limit(5);

    const context = `
Products:
${products.map(p => `${p.name} - ₹${p.price}`).join("\n")}

Services:
${services.map(s => `${s.title} - ${s.location}`).join("\n")}
`;

    // =========================
    // 🔥 DEBUG API KEY
    // =========================
    if (!process.env.OPENROUTER_API_KEY) {
      console.log("❌ OPENROUTER_API_KEY missing");
      return res.json({
        reply: "AI service not configured. Contact admin.",
      });
    }

    // =========================
    // 🤖 OPENROUTER REQUEST
    // =========================
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are a smart pet care assistant.
Use platform data if useful:
${context}
Keep answers short and helpful.`,
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
          "HTTP-Referer": "https://petcare16.netlify.app",
          "X-Title": "PetCare AI",
        },
        timeout: 20000, // prevent hanging
      }
    );

    const reply =
      response?.data?.choices?.[0]?.message?.content ||
      "No response from AI";

    res.json({ reply });

  } catch (error) {
    console.log("🔥 CHAT ERROR:");
    console.log(error?.response?.data || error.message);

    res.status(500).json({
      reply: "AI service temporarily unavailable. Try again 🐾",
    });
  }
});

module.exports = router;