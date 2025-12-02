import { Api } from "./api.js";

export class Chat {
    constructor() {
        this.messages = [];
    }

    getMessages() {
        return this.messages;
    }

    async send(content, ...apiArgs) {
        this.messages.push({ role: "user", content });

        const api = new Api({
            messages: this.messages,
            model: "nvidia/nemotron-nano-9b-v2:free"
        });

        api.send(...apiArgs);
    }
}