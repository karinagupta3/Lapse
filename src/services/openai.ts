import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const chatWithAssistant = async (messages: Message[]) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful productivity assistant integrated into the Lapse app. 
            When users mention activities like "gym", "work", or "study", suggest specific time slots based on these guidelines:
            - Early morning (6-8 AM) is good for gym and exercise
            - Mid-morning (9-11 AM) is ideal for focused work
            - Afternoon (2-4 PM) works well for meetings and collaborative tasks
            - Evening (5-7 PM) can be for gym or light work
            
            Format time suggestions like this:
            Based on your patterns, here are some suggested times:
            1. [Day] at [Time] ([Duration])
            2. [Day] at [Time] ([Duration])
            3. [Day] at [Time] ([Duration])
            
            Keep responses concise and actionable.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 250,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to get response from assistant');
  }
};
