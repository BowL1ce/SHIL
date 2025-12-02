import { Chat } from "./engine/chat.js";
import 'dotenv/config';

const chat = new Chat();
chat.send(
  "привет",
  async (chunk) => {
    console.log(chunk);
  },
  async (full) => {
    console.log(full);
  }
);

console.log(chat.messages);
