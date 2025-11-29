const APIClient = require('./api-client');
const Storage = require('./storage');
const { parseTools, parseFunctionToTool } = require('./tools-parser');
const { parseSSEChunk, generateChatId } = require('./utils');

class ChatEngine {
  constructor(apiKey = process.env.OPENROUTER_API_KEY) {
    if (!apiKey) throw new Error('API key required');
    this.apiKey = apiKey;
    this.tools = [];
  }
  
  addTools(functions) {
    const parsed = parseTools(functions);
    this.tools = [...this.tools, ...parsed];
  }

  createChat(options = {}) {
    const chatId = options.chatId || generateChatId();
    Storage.createChat(chatId);
    if (options.systemMessage) {
      Storage.addMessage(chatId, 'system', options.systemMessage);
    }
    return chatId;
  }

  getChatHistory(chatId) {
    return Storage.getMessages(chatId);
  }

  clearChat(chatId) {
    Storage.clearChat(chatId);
  }

  static async listModels(limit = 10) {
    return APIClient.listModels(limit);
  }

  async sendMessage(chatId, userMessage, options = {}) {
    const { stream = false, model = 'openai/gpt-4o-mini', tools: overrideTools, ...apiOptions } = options;

    const messages = Storage.getMessages(chatId);
    messages.push({ role: 'user', content: userMessage });

    const finalTools = overrideTools ? parseTools(overrideTools) : this.tools;

    const apiResponse = await APIClient.chatCompletion({
      messages,
      model,
      stream,
      tools: finalTools,
      ...apiOptions
    });

    if (!stream) {
      const choice = apiResponse.choices[0];
      const content = choice.message.content || '';
      const toolCalls = choice.message.tool_calls || null;
      const reasoning = choice.message.reasoning || null;
      Storage.addMessage(chatId, 'assistant', content, toolCalls, reasoning);

      if (toolCalls) {
        console.log('Tool calls detected:', toolCalls);
      }

      return { content, toolCalls, reasoning, usage: apiResponse.usage };
    } else {
      const { body, waitForEnd } = apiResponse;

      const stream = this.createAsyncIterableStream(body);

      const fullResponse = await this._collectStreamContent(stream, waitForEnd);
      Storage.addMessage(chatId, 'assistant', fullResponse.content, null, fullResponse.reasoning);

      return stream;
    }
  }

  createAsyncIterableStream(readableStream) {
    const { Transform } = require('stream');
    const { pipeline } = require('stream/promises');

    return (async function* () {
      let buffer = '';
      const decoder = new require('util').TextDecoder();

      const transform = new Transform({
        transform(chunk, encoding, callback) {
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          lines.forEach(line => {
            if (line.trim()) {
              const parsed = parseSSEChunk(line);
              if (parsed && !parsed.error) {
                this.push(JSON.stringify(parsed));
              }
            }
          });
          callback();
        },
        flush(callback) {
          if (buffer.trim()) {
            const parsed = parseSSEChunk(buffer);
            if (parsed && !parsed.error) {
              this.push(JSON.stringify(parsed));
            }
          }
          callback();
        }
      });

      await pipeline(readableStream, transform, new require('stream').PassThrough());
      yield JSON.stringify({ done: true });
    })();
  }

  async _collectStreamContent(stream, waitForEnd) {
    let content = '';
    let reasoning = '';
    try {
      for await (const chunkStr of stream) {
        const chunk = JSON.parse(chunkStr);
        if (chunk.done) break;

        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) {
          content += delta.content;
        }
        if (delta?.reasoning) {
          reasoning += delta.reasoning;
        }
      }
    } catch (err) {
      console.error('Stream collect error:', err);
    }
    await waitForEnd();
    return { content, reasoning };
  }
}

module.exports = ChatEngine;