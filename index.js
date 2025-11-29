require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');

var chats = new Map();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
