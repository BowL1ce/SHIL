import { Chat } from "./engine/chat.js";
import 'dotenv/config';

const tools = [
  {
    type: "function",
    function: {
      name: "getUserIdByNick",
      description: "Получает ID пользователя по никнейму",
      parameters: { type: "object", properties: { nick: { type: "string" } }, required: ["nick"] }
    },
    execute: async (args) => {
      console.log(1);
      return "пон";
    }
  }
];

(async () => {
  const chat = new Chat();
  await chat.send(
    "какой ID у пользователя @vasya?",
    async (response) => {
      
    },
    async (response) => {
      
    },
    tools
  );

  console.log(chat.messages);
})();
