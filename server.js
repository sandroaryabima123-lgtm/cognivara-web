require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors()); // Mengizinkan akses dari frontend
app.use(express.json()); // Parsing data JSON yang masuk

// ----------------------------------------------------
// THE API ENDPOINT
// ----------------------------------------------------
app.post('/api/generate', async (req, res) => {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // DeepSeek API Configuration
        const response = await axios.post(
            'https://api.deepseek.com/chat/completions',
            {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are an elite web developer AI. Your job is to convert the user's prompt into a COMPLETE, fully functional, responsive HTML website. 
                        RULES:
                        1. Reply ONLY with the raw HTML code. 
                        2. DO NOT wrap the code in markdown formatting like \`\`\`html.
                        3. DO NOT include any explanations or conversational text.
                        4. Include CSS inside a <style> tag and JavaScript inside a <script> tag all within the same file.`
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                temperature: 0.2 
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Ekstraksi konten dari AI
        let aiGeneratedHtml = response.data.choices[0].message.content;

        // Failsafe: Membersihkan markdown jika AI tidak patuh
        aiGeneratedHtml = aiGeneratedHtml.replace(/^```html\n/, '').replace(/\n```$/, '');

        // Mengirimkan HTML kembali ke frontend
        res.json({ html: aiGeneratedHtml });

    } catch (error) {
        console.error("DeepSeek API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate website" });
    }
});

// EXPORT UNTUK VERCEL (PENTING)
module.exports = app;