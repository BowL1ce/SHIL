import { Chat } from "../engine/chat.js"
import { Message } from "./Message.js";
import { models } from "../index.js";

export class DiscordChat {
    constructor() {
        this.models = 
        this.botMessages = []
        this.chat = new Chat()
        this.message = null

        this.chat.model = models[Math.floor(Math.random() * models.length)]
    }

    async send(message) {
        this.botMessages.push(
            new Message(this.chat)
        );

        const response = await this.chat.send(
            message.content,
            async (response) => {
                this.botMessages[this.botMessages.length - 1].execude(message, response)
            },
            1000
        );

        this.botMessages[this.botMessages.length - 1].execudeFinal(message, response)
    }
}