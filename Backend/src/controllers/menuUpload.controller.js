const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const JSON_PROMPT = `You are a helpful AI that parses restaurant menus.
Extract the menu items from the following content. Return ONLY a valid JSON object matching exactly this structure:
{
  "categories": [
    {
      "name": "Category Name (e.g. Starters, Main Course, Drinks)",
      "items": [
        {
          "name": "Item Name",
          "description": "Item description if available, otherwise empty string",
          "price": 100,
          "isVeg": true or false
        }
      ]
    }
  ]
}
If a price is missing, use 0. If "isVeg" is unclear, assume false (or true if it clearly says Veg).
Do not include any markdown backticks, explanations, or extra text. ONLY raw JSON.`;

async function parseMenuUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured on server." });
    }

    const { mimetype, buffer } = req.file;

    let extractedText = "";
    let chatCompletion;

    // Handle PDF
    if (mimetype === "application/pdf") {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (err) {
        return res.status(400).json({ error: "Failed to parse PDF file." });
      }

      chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: JSON_PROMPT },
          { role: "user", content: "Here is the menu text:\n" + extractedText },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });
    } 
    // Handle Images
    else if (mimetype.startsWith("image/")) {
      const base64Image = buffer.toString("base64");
      const imageUrl = `data:${mimetype};base64,${base64Image}`;

      chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: JSON_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Parse this menu image into the requested JSON format." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.1,
      });
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or Image." });
    }

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: "AI failed to generate a response." });
    }

    // Try to parse the JSON
    let parsedData;
    try {
      // Find the first { and last } to extract just the JSON part
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON object found in response");
      }
      
      const jsonString = content.slice(firstBrace, lastBrace + 1);
      parsedData = JSON.parse(jsonString);
    } catch (err) {
      console.error("Groq JSON Parse Error:", content);
      return res.status(500).json({ error: "Failed to parse AI output into JSON." });
    }

    res.json({ success: true, data: parsedData });
  } catch (err) {
    console.error("Menu Upload Parsing Error:", err);
    res.status(500).json({ error: "An error occurred while processing the menu file." });
  }
}

module.exports = { parseMenuUpload };
