import { Chat } from "../engine/Chat.js"

export class DiscordChat {
    constructor() {
        this.botMessages = []
        this.chat = new Chat()
        this.currentMessage = null
    }

    async send(message) {
        const response = await this.chat.send(
            message.content,
            async (response) => {
                const messageData = {
                    content: "```\n" + (response.reasoning ?? "") + "\n```\n" + response.content
                }

                if (!this.currentMessage) {
                    this.currentMessage = await message.reply(messageData)
                } else {
                    await this.currentMessage.edit(messageData)
                }
            }
        )

        console.log(response);

        const messageData = {
            content: "```\n" + (response.reasoning ?? "") + "\n```\n" + response.content
        }

        if (!this.currentMessage) {
            this.currentMessage = await message.reply(messageData)
        } else {
            await this.currentMessage.edit(messageData)
        }

        this.botMessages.push(this.currentMessage);

        this.currentMessage = null;
    }
}