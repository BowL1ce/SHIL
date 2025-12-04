import { Api } from "./Api.js";

export class Chat {
    constructor() {
        this.messages = [];

        this.include_reasoning = true;
    }

    async send(content, ...apiArgs) {
        this.messages.push({ role: "user", content });

        const api = new Api({
            messages: this.messages.slice(),
            model: "nvidia/nemotron-nano-9b-v2:free",
            reasoning: {
                max_tokens: 1200,
                include_reasoning: this.include_reasoning
            },
            max_tokens: 400
        });

        const response = await api.send(...apiArgs);

        this.messages.push({
            role: api.response.role,
            content: api.response.content,
        })

        return response;
    }
}