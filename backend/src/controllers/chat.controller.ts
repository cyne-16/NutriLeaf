import { Request, Response } from 'express';
import axios from 'axios';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation history
    const messages = [
      ...history,
      { role: 'user', content: message }
    ];

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages,
        system: `You are an expert agricultural assistant specializing in malunggay (moringa) cultivation. 
        You help Filipino farmers with:
        - Growing tips and best practices
        - Disease identification and treatment
        - Harvest timing optimization
        - Nutritional information
        - Market insights and pricing
        - Product recommendations
        
        Be concise, practical, and culturally appropriate for Filipino farmers.`
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const assistantMessage = response.data.content[0].text;

    res.json({
      message: assistantMessage,
      conversationId: req.body.conversationId || Date.now().toString()
    });

  } catch (error: any) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Chat failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
};