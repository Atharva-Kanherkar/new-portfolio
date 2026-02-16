import { NextRequest } from 'next/server';
import { SYSTEM_PROMPT } from '../prompt';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 });
    }

    if (message.length > 1000) {
      return new Response('Message too long (max 1000 characters)', { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey || apiKey === 'your_perplexity_api_key_here') {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
        return new Response('No AI provider configured. Please add PERPLEXITY_API_KEY or GEMINI_API_KEY to environment variables.', { status: 503 });
      }
      return streamGeminiResponse(message, conversationHistory, encoder);
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamPerplexityToController(message, conversationHistory, controller, encoder, apiKey);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('[Stream] Perplexity error:', error);
          try {
            await streamGeminiToController(message, conversationHistory, controller, encoder);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
            controller.close();
          } catch {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Failed to generate response' })}\n\n`));
            controller.close();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}

async function streamPerplexityToController(
  message: string,
  conversationHistory: { role: string; content: string }[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  apiKey: string
) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages,
      temperature: 0.8,
      max_tokens: 1024,
      top_p: 0.95,
      stream: true,
      search_recency_filter: 'month',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;
        try {
          const data = JSON.parse(payload);
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content })}\n\n`));
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

async function streamGeminiToController(
  message: string,
  conversationHistory: { role: string; content: string }[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key');

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: { temperature: 0.8, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content })}\n\n`));
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

async function streamGeminiResponse(
  message: string,
  conversationHistory: { role: string; content: string }[],
  encoder: TextEncoder
) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamGeminiToController(message, conversationHistory, controller, encoder);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Failed to generate response' })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
