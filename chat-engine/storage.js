const chats = new Map(); // chatId -> { messages: [{role, content, tool_calls?}] }

class Storage {
  createChat(chatId) {
    if (!chats.has(chatId)) {
      chats.set(chatId, { messages: [] });
    }
    return chatId;
  }

  getMessages(chatId) {
    const chat = chats.get(chatId);
    if (!chat) throw new Error('Chat not found');
    return chat.messages;
  }

  addMessage(chatId, role, content, toolCalls = null, reasoning = null) {
    const chat = chats.get(chatId);
    if (!chat) throw new Error('Chat not found');
    chat.messages.push({ role, content, tool_calls: toolCalls, reasoning });
  }

  clearChat(chatId) {
    chats.delete(chatId);
  }
}

module.exports = new Storage();