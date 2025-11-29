const parseSSEChunk = (chunk) => {
  if (chunk.trim() === 'data: [DONE]') return { done: true };
  if (chunk.startsWith('data: ')) {
    try {
      const data = JSON.parse(chunk.slice(6).trim());
      if (data.choices?.[0]?.delta) {
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const handleError = (err) => {
  console.error('ChatEngine Error:', err.message);
  throw new Error(`API Error: ${err.message}`);
};

const generateChatId = () => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

module.exports = { parseSSEChunk, handleError, generateChatId };