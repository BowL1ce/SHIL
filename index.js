import { Chat } from "./engine/chat.js";
import { webSearch } from "./engine/tools/webSearch.js";
import 'dotenv/config';

(async () => {
  const chat = new Chat();
  await chat.send(
    "поищи в интернете погоду в москве",
    async (response) => {
      
    },
    async (response) => {
        console.log(response);
    },
    [webSearch]
  );

  console.log(chat.messages);
})();
