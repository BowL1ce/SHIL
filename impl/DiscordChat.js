import { Chat } from "../engine/Chat.js"

export class DiscordChat {
    constructor() {
        this.botMessages = []
        this.chat = new Chat()
    }

    async send(message) {
        const response = await this.chat.send(
            message.content,
            async (response) => {
                // TODO
            }
        )

        const botMessage = await message.reply({
            content: "```\n" + response.reasoning + "\n```\n" + response.content
        })
        this.botMessages.push(botMessage);
    }
}