import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { botMentionedIn } from "./utility/botMentionedIn.js";
import { DiscordChat } from "./impl/DiscordChat.js";
import { buttonsId } from "./utility/buttonsId.js";
import { toggleReasoning, clearChat, changeModel } from "./impl/buttons.js";

export const chats = {}
export const models = [
  "amazon/nova-2-lite-v1:free",
  "nvidia/nemotron-nano-12b-v2-vl:free"
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
    const referencedMessage = await inter.channel.messages.fetch(inter.message.reference.messageId);
    const isAuthorUser = referencedMessage.author.id === inter.user.id;
    const isAuthorBot = referencedMessage.author.id === client.user.id;

    if (!isAuthorUser && !isAuthorBot) {
      await inter.reply({
        content: "this is not your chat",
        ephemeral: true
      })
      return;
    }

    switch (inter.customId.split("_")[0]) {
      case buttonsId.Reasoning: {
        await toggleReasoning(inter);
        return;
      }
      case buttonsId.Clear: {
        await clearChat(inter);
        return;
      }
      case buttonsId.ChangeModel: {
        await changeModel(inter, inter.customId.split("_")[1]);
        return;
      }
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

