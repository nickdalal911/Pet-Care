const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("KEY:", process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(message);

    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.log("🔥 ERROR:", error);
    res.status(500).json({ reply: "AI failed" });
  }
});