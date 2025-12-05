import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { botMentionedIn } from "./utility/botMentionedIn.js";
import { DiscordChat } from "./impl/DiscordChat.js";
import { buttonsId } from "./utility/buttonsId.js";
import { toggleReasoning, clearChat } from "./impl/buttons.js";

export const chats = {}
export const models = [
  "nvidia/nemotron-nano-9b-v2:free",
  //"arcee-ai/trinity-mini:free" // по какимто причинам, в новейших моделях решили переделать нахуй json схему стрим вывода, если вы будете готовы чинить класс Api, пожалуйса
]

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

client.on(Events.InteractionCreate, async (inter) => {
  if (inter.isButton()) {
    if (
      (
        await inter.channel.messages.fetch(
          inter.message.reference.messageId
        )
      ).author.id != inter.user.id
    ) {
      await inter.reply({
        content: "this is not your chat",
        ephemeral: true
      })
      return;
    }

    switch (inter.customId) {
      case buttonsId.Reasoning: await toggleReasoning(inter);
      case buttonsId.Clear: await clearChat(inter);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (!botMentionedIn(client, message)) return;

  const id = message.author.id;

  if (!chats[id]) chats[id] = new DiscordChat();

  message.content = message.content.replace(
    `<@${client.user.id}>`, ""
  ).trim()

  await chats[id].send(message)
});

client.login(process.env.DISCORD_TOKEN);

