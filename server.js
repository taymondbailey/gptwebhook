import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Health check / landing
app.get("/", (req, res) => {
  res.send("Webhook is running and ready on Render!");
});

// Webhook endpoint
app.post("/", async (req, res) => {
  const { question, response, owns_home, handles_bill } = req.body || {};

  // Basic validation
  if (typeof response === "undefined") {
    return res.status(400).json({ error: "Missing 'response' in request body." });
  }
  if (typeof owns_home === "undefined") {
    return res.status(400).json({ error: "Missing 'owns_home' in request body." });
  }
  if (typeof handles_bill === "undefined") {
    return res.status(400).json({ error: "Missing 'handles_bill' in request body." });
  }

  const prompt = `
You are a friendly and caring phone representative speaking with a homeowner.
Start by asking: "Hi! I just wanted to check, were you living in this home during Hurricane Beryl a while back?"
Listen for a simple yes or no answer. Respond warmly and naturally, showing empathy if they experienced any difficulties.

Here’s what the caller said: ${response}
Homeowner owns the home: ${owns_home}
Homeowner handles the bill: ${handles_bill}

If they answer yes, and they own the home and handle the bill, consider them a warm lead and respond accordingly.
Keep the tone conversational and polite.
`;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set in environment." });
    }

    const gpt = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await gpt.json();
    if (!gpt.ok) {
      return res.status(502).json({ error: "OpenAI API error", details: data });
    }

    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return res.json({
      actions: [
        { say: { speech: reply } },
        // Replace with your actual Twilio Studio/Function endpoint if desired
        { redirect: "https://your-twilio-flow-endpoint-to-SMS-or-log" }
      ]
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GPT Webhook Running on port ${PORT}`);
});
