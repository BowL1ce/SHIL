import { EmbedBuilder } from "discord.js";

export class Message {
    constructor() {
        this.messages = [];
        this.currentIndex = 0;
    }

    _messageData(response) {
        const messageData = {
            content: response.content,
            embeds: []
        }
        if (messageData.content === "") messageData.content = "..."
        if (response.reasoning) messageData.embeds.push(
            new EmbedBuilder()
            .setTitle("reasoning")
            .setDescription(response.reasoning)
        )

        for (const tool of response.toolCalls) {
            messageData.embeds.push(
                new EmbedBuilder()
                .setTitle(tool.name)
                .setDescription(tool.arguments)
                .addFields({ 
                    name: 'result', 
                    value: (tool.result ?? '—').toString().slice(0, 500),
                    inline: true 
                })
            );
        }

        return messageData;
    }

    async execude(message, chat) {
        const messageData = this._messageData(chat.api.response);

        if (this.messages.length === 0) {
            this.messages.push(
                await message.reply(messageData)
            );
        } else {
            await this.messages[this.messages.length - 1].edit(messageData)
        }
    }

    async execudeFinal(message, chat) {
        
        
        const messageData = this._messageData(chat.api.response);

        const button = new ButtonBuilder()
        .setCustomId('reasoning')
        .setLabel('🧠')
        .setStyle(chat.reasoning ? ButtonStyle.Primary : ButtonStyle.Secondary);
        messageData.components = [
            new ActionRowBuilder()
            .addComponents(button)
        ];

        if (!this.messages) {
            this.messages.push(
                await message.reply(messageData)
            );
        } else {
            await this.messages[this.messages.length - 1].edit(messageData)
        }
    }
}