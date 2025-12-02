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

const chat = new Chat();
chat.send(
  "какой ID у пользователя @vasya?",
  async (buffer) => {
    
  },
  async (response) => {
    console.log(response)
  },
  tools
);

console.log(chat.getMessages());
