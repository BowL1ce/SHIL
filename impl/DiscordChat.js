import { Chat } from "../engine/Chat.js"
import { EmbedBuilder } from "discord.js";
import { webSearch } from "../engine/tools/webSearch.js"

export class DiscordChat {
    constructor() {
        this.botMessages = []
        this.chat = new Chat()
        this.currentMessage = null
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

    async send(message) {
        const response = await this.chat.send(
            message.content,
            async (response) => {
                const messageData = this._messageData(response);

                if (!this.currentMessage) {
                    this.currentMessage = await message.reply(messageData)
                } else {
                    await this.currentMessage.edit(messageData)
                }
            },
            [webSearch],
            1000
        );

        const messageData = this._messageData(response);

        if (!this.currentMessage) {
            this.currentMessage = await message.reply(messageData);
        } else {
            await this.currentMessage.edit(messageData);
        }

        this.botMessages.push(this.currentMessage);

        this.currentMessage = null;
    }
}