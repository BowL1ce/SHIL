import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { buttonsId } from "../utility/buttonsId.js";

export class Message {
    constructor(chat) {
        this.message = null;
        this.currentIndex = 0;

        this.chat = chat;
    }

    _messageData(response) {
        const messageData = {
            content: response.content,
            embeds: []
        }
        if (messageData.content === "") messageData.content = "..."

        const reasoning = response.reasoning
        if (response.reasoning) messageData.embeds.push(
            new EmbedBuilder()
            .setTitle("reasoning")
            .setDescription(reasoning)
        )

        for (const tool of response.toolCalls) {
            let text = "";
            try {
                text = Object.entries(JSON.parse(tool.arguments ?? "{}"))
                .map(([key, value]) => `**${key}**: ${value ?? '—'}`)
                .join('\n')
            } catch {
                text = "-"
            }

            messageData.embeds.push(
                new EmbedBuilder()
                .setTitle(tool.name)
                .setDescription(text)
                .addFields({ 
                    name: 'result', 
                    value: (tool.result ?? '-').toString().slice(0, 500),
                    inline: true 
                })
            );
        }

        return messageData;
    }

    async execude(message, response) {
        const messageData = this._messageData(response);

        if (!this.message) {
            this.message = await message.reply(messageData);
        } else {
            await this.message.edit(messageData)
        }
    }

    async execudeFinal(message, response) {
        const messageData = this._messageData(response);

        const reasoning = new ButtonBuilder()
            .setCustomId(buttonsId.Reasoning)
            .setLabel('🧠')
            .setStyle(this.chat.reasoning ? ButtonStyle.Secondary : ButtonStyle.Primary);
        const clear = new ButtonBuilder()
            .setCustomId(buttonsId.Clear)
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Danger);
        const change = new ButtonBuilder()
            .setCustomId(buttonsId.ChangeModel)
            .setLabel('change model')
            .setStyle(ButtonStyle.Secondary)

        messageData.components = [
            new ActionRowBuilder()
            .addComponents([reasoning, clear, change]),
        ];

        if (!this.message) {
            this.message = await message.reply(messageData);
        } else {
            await this.message.edit(messageData)
        }
    }
}