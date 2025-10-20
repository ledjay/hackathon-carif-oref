import { NextRequest } from "next/server";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Extract the last user message
  const lastMessage = messages[messages.length - 1];
  const chatInput = lastMessage?.content || "";

  // Generate or retrieve sessionId
  const sessionId =
    req.headers.get("x-session-id") || crypto.randomUUID().replace(/-/g, "");

  const n8nResponse = await fetch(process.env.N8N_CHAT_STREAM_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      action: "sendMessage",
      chatInput,
    }),
  });

  if (!n8nResponse.ok) throw new Error(`Erreur n8n: ${n8nResponse.status}`);

  // Create a custom readable stream that parses n8n's format
  let buffer = '';
  
  const textStream = new ReadableStream({
    async start(controller) {
      const reader = n8nResponse.body!.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              console.log('Parsed n8n chunk:', data);
              
              // Only process 'item' type chunks with content
              if (data.type === 'item' && data.content) {
                controller.enqueue(data.content);
              }
            } catch (e) {
              console.error('Failed to parse n8n chunk:', line, e);
            }
          }
        }
        
        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.type === 'item' && data.content) {
              controller.enqueue(data.content);
            }
          } catch (e) {
            console.error('Failed to parse final chunk:', buffer, e);
          }
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  // Convert to proper data stream format for Vercel AI SDK
  const encoder = new TextEncoder();
  const dataStream = new ReadableStream({
    async start(controller) {
      const reader = textStream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Encode as data stream format: "0:" prefix for text chunks
          controller.enqueue(encoder.encode(`0:${JSON.stringify(value)}\n`));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(dataStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Session-Id": sessionId,
    },
  });
}
