const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');

// POST /api/ai/suggest-response
// Uses Anthropic API to generate a suggested response for a leader
router.post('/suggest-response', protect, restrictTo('leader', 'admin'), async (req, res) => {
  try {
    const { issueTitle, issueDescription, issueCategory, issueLocation } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ success: false, message: 'AI service not configured. Set ANTHROPIC_API_KEY in .env' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are an assistant helping Rwandan local government leaders (Umuyobozi) respond professionally to citizen issue reports (CitizenConnect system). 
Write clear, empathetic, action-oriented responses in English. 
Responses should: acknowledge the issue, explain next steps, give a realistic timeframe, and end with reassurance.
Keep responses concise (2-3 sentences max). Do not include greetings or sign-offs.`,
        messages: [{
          role: 'user',
          content: `Issue Category: ${issueCategory}
Location: ${issueLocation}
Title: ${issueTitle}
Description: ${issueDescription}

Write a professional response for this citizen issue:`
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(502).json({ success: false, message: data.error?.message || 'AI service error' });

    const suggestion = data.content?.[0]?.text || '';
    res.json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/categorize
// Auto-categorize and set priority for a submitted issue
router.post('/categorize', protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ success: true, category: 'Other', priority: 'medium' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: `You categorize citizen issue reports. Respond ONLY with valid JSON like: {"category":"Infrastructure","priority":"high"}
Categories: Infrastructure, Roads, Sanitation, Water, Health, Education, Security, Agriculture, Environment, Other
Priorities: low, medium, high, urgent`,
        messages: [{ role: 'user', content: `Title: ${title}\nDescription: ${description}` }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json({ success: true, ...result });
  } catch (err) {
    res.json({ success: true, category: 'Other', priority: 'medium' });
  }
});

module.exports = router;
