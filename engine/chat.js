import { Api } from "./api.js";

export class Chat {
    constructor() {
        this.messages = [];
    }

    async send(content, ...apiArgs) {
        this.messages.push({ role: "user", content });

        const api = new Api({
            messages: this.messages.slice(),
            model: "nvidia/nemotron-nano-9b-v2:free"
        });

        await api.send(...apiArgs);

        this.messages.push({
            role: api.response.role,
            content: api.response.content,
        })
    }
}