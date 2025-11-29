require('dotenv').config();
const ChatEngine = require('./chat-engine');

function getWeather(city) {
  /** Get current weather for a city. @param {string} city - The city name. */
  // TODO: real impl
  return `Weather in ${city}: Sunny, 25°C`;
}

const engine = new ChatEngine();
engine.addTools(getWeather);

const chatId = engine.createChat({ systemMessage: 'You are a helpful assistant.' });

(async () => {
    const response = await engine.sendMessage(
        chatId, 
        'What is the weather in Moscow?', 
        { model: "tngtech/tng-r1t-chimera:free", }
    );
    console.log('Response:', response.content);
})();


(async () => {
  const stream = await engine.sendMessage(chatId, 'Tell a long story.', { stream: true });
  // Обработка: for await (const chunk of stream) { process.stdout.write(chunk.choices[0].delta?.content || ''); }
  console.log('Stream processed');
})();