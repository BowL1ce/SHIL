import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';

export const chats = {}

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.MessageCreate, async (message) => {
  console.log(message);
});

client.login(process.env.DISCORD_TOKEN);