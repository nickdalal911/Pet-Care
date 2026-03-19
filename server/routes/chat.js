const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔥 import your models (adjust paths if needed)
const Product = require("../models/Product");
const Service = require("../models/Service");

router.get("/", (req, res) => {
  res.json({ message: "Chat GET working" });
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const msg = message.toLowerCase();

    // =========================
    // 🛒 PRODUCT SEARCH FROM DB
    // =========================
    if (msg.includes("product") || msg.includes("buy")) {
      const products = await Product.find().limit(5);

      if (products.length > 0) {
        const reply = products
          .map(p => `• ${p.name} - ₹${p.price}`)
          .join("\n");

        return res.json({
          reply: `Here are some products from our platform 🛒:\n${reply}`
        });
      }
    }

    // =========================
    // 🐾 SERVICE SEARCH FROM DB
    // =========================
    if (msg.includes("service") || msg.includes("vet")) {
      const services = await Service.find().limit(5);

      if (services.length > 0) {
        const reply = services
          .map(s => `• ${s.title} (${s.location})`)
          .join("\n");

        return res.json({
          reply: `Available pet services 🐾:\n${reply}`
        });
      }
    }

    // =========================
    // 🧠 FETCH CONTEXT FROM DB
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
    // 🤖 AI RESPONSE (OpenRouter)
    // =========================
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
       model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are a smart pet care assistant.
Use the following platform data if relevant:
${context}
Give helpful, clear, and short answers.`,
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
  "HTTP-Referer": "https://petcare16.netlify.app", // 🔥 REQUIRED
  "X-Title": "PetCare AI" // 🔥 REQUIRED
}
        // headers: {
        //   Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        //   "Content-Type": "application/json",
        // },
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);

    res.json({
      reply: "Something went wrong, please try again 🐾",
    });
  }
});

module.exports = router;