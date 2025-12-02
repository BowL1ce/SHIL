import { Api } from "./api.js";

export class Chat {
    constructor() {
        this.messages = [];
    }

    send(content, onStream, onFinal) {
        this.messages.push({
            role: "user",
            content: content
        });

        const api = new Api({
            messages: this.messages,
            model: "nvidia/nemotron-nano-9b-v2:free"
        });

        api.send(
            onStream,
            async (full) => {
                this.messages.push({
                    role: "assistant",
                    content: full.choices?.[0]?.delta?.content
                });
                await onFinal();
            }
        );
    }
}