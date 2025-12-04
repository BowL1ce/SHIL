import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { botMentionedIn } from "./utility/botMentionedIn.js";
import { DiscordChat } from "./impl/DiscordChat.js";

export const chats = {}

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, async (message) => {
  if (!botMentionedIn(client, message)) return;

  const id = message.author.id;

  if (!chats[id]) chats[id] = new DiscordChat();

  await chats[id].send(message)
});

client.login(process.env.DISCORD_TOKEN);

