import express from "express";
import { toolDescriptions, tools } from "./toolRegistry.js";
import { askAI } from "./ai.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.post("/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const prompt = `
You are an MCP controller.

${toolDescriptions}

User question: "${question}"

Respond ONLY in JSON:
{
  "tool": "toolName",
  "args": { }
}
`;

    const aiResponse = await askAI(prompt);
    if (!aiResponse) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    // clean response
    const jsonText = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(jsonText);

    if (!parsed.args) {
      parsed.args = {};
    }

    parsed.args.schoolId = "testing_school";

    const tool = tools[parsed.tool as keyof typeof tools];

    if (!tool) {
      return res.json({ error: "Invalid tool" });
    }

    const data = await tool(parsed.args);

    res.json({
      toolUsed: parsed.tool,
      args: parsed.args,
      data,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI parsing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});