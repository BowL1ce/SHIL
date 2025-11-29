const fetch = require('node-fetch');
const { pipeline } = require('stream/promises');
const { handleError } = require('./utils');
require('dotenv').config();

const API_BASE = 'https://openrouter.ai/api/v1';
const API_KEY = process.env.OPENROUTER_API_KEY;
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

class APIClient {
  static async listModels(limit = 10) {
    const response = await fetch(`${API_BASE}/models?limit=${limit}`, { headers: HEADERS });
    if (!response.ok) handleError(new Error(`HTTP ${response.status}`));
    return response.json();
  }

  static async chatCompletion({ messages, model, stream = false, tools = null, tool_choice = 'auto', include_reasoning = false, ...options }) {
    const body = {
      model,
      messages,
      stream,
      tools,
      tool_choice,
      include_reasoning,
      ...options
    };

    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      handleError(new Error(err));
    }

    if (!stream) {
      return response.json();
    } else {
      return {
        body: response.body,
        waitForEnd: () => pipeline(response.body, new require('stream').PassThrough())
      };
    }
  }
}

module.exports = APIClient;