import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { DiscordChat } from "./impl/DiscordChat.js";

export const chats = {}

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.ClientReady, async (client) => {
  console.log(`logged as ${client.user.globalName}`);
});

client.on(Events.MessageCreate, async (message) => {
  const id = message.author.id;

  console.log(message);

  // if (!chats[id]) chats[id] = new DiscordChat();

  // await chats[id].send(message)
});

client.login(process.env.DISCORD_TOKEN);