import { Chat } from "./engine/chat.js";
import 'dotenv/config';

const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "web search tool",
      parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    },
    execute: async (args) => {
      console.log(args);
      return "По данным на 19:32 3 декабря 2025 года, в Москве температура +2°, ясно, влажность 91%, давление 759 мм, ветер 1 м/с, до 2 м/с, ЮЗ.К 23:00 ожидается температура +2°, пасмурно, влажность 90%, давление 758 мм, ветер 1 м/с, до 2 м/с, ЮЗ"
    },
    loop: true
  }
];

(async () => {
  const chat = new Chat();
  await chat.send(
    "поищи в интернете погоду в москве",
    async (response) => {
      
    },
    async (response) => {
        console.log(response);
    },
    tools
  );

  console.log(chat.messages);
})();
