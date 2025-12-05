import { Chat } from "../engine/Chat.js"
import { webSearch } from "../engine/tools/webSearch.js"
import { Message } from "./Message.js";

export class DiscordChat {
    constructor() {
        this.botMessages = []
        this.chat = new Chat()
        this.message = null
    }

    async send(message) {
        this.botMessages.push(
            new Message()
        );

        const response = await this.chat.send(
            message.content,
            async (response) => {
                this.botMessages[this.botMessages.length - 1].execude(message, response)
            },
            [webSearch],
            1000
        );

        this.botMessages[this.botMessages.length - 1].execudeFinal(message, response)
    }
}