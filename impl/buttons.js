import { chats, models } from "../index.js";
import { buttonsId } from "../utility/buttonsId.js";
import { DiscordChat } from "./DiscordChat.js";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export async function toggleReasoning(inter) {
    const chat = chats[inter.user.id]?.chat
    
    if (!chat) {
        await inter.reply({
            content: "chat not found",
            ephemeral: true
        })
        return;
    }

    chat.reasoning = !chat.reasoning;

    await inter.reply({
        content: chat.reasoning ? "reasoning disabled" : "reasoning enabled",
        ephemeral: true
    })

    const reasoning = new ButtonBuilder()
        .setCustomId(buttonsId.Reasoning)
        .setLabel('🧠')
        .setStyle(chat.reasoning ? ButtonStyle.Secondary : ButtonStyle.Primary);
    const clear = new ButtonBuilder()
        .setCustomId(buttonsId.Clear)
        .setLabel('🗑️')
        .setStyle(ButtonStyle.Danger);
    const change = new ButtonBuilder()
        .setCustomId(buttonsId.ChangeModel)
        .setLabel('change model')
        .setStyle(ButtonStyle.Secondary)

    await inter.message.edit({
        components: [new ActionRowBuilder()
        .addComponents([reasoning, clear, change])]
    })
}

export async function clearChat(inter) {
    const chat = chats[inter.user.id]?.chat;
    
    if (!chat) {
        await inter.reply({
            content: "chat not found",
            ephemeral: true
        });
        return;
    }

    delete chats[inter.user.id];

    await inter.reply({
        content: "chat deleted",
        ephemeral: true
    })
}

export async function changeModel(inter, modelId=null) {
    const id = inter.user.id;
    if (!chats[id]) chats[id] = new DiscordChat();

    const chat = chats[id];

    if (!modelId) {
        const buttons = [];
        for (const model of models) {
            buttons.push(
                new ButtonBuilder()
                .setCustomId(`${buttonsId.ChangeModel}_${model}`)
                .setLabel(model)
                .setStyle(ButtonStyle.Secondary)
            );
        }
        await inter.reply({
            content: "chose model:",
            components: [
                new ActionRowBuilder()
                .addComponents(buttons)
            ],
            ephemeral: true
        });
    } else {
        chat.model = modelId;
        await inter.reply({
            content: `the model has been changed to \`${modelId}\``,
            ephemeral: true
        })
    }
}