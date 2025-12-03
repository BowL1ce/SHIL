import { Api } from "./api.js";

export class Chat {
    constructor() {
        this.messages = [];
    }

    async send(content, ...apiArgs) {
        this.messages.push({ role: "user", content });

        const api = new Api({
            messages: this.messages,
            model: "nvidia/nemotron-nano-9b-v2:free"
        });

        api.send(...apiArgs);

        apiArgs.onFinal = async (response) => {
            this.messages.push({
                role: response.role,
                content: response.content,
            })
            console.log(this.messages);
            await apiArgs.onFinal(response)
        }
    }

    editLastAssistantMessage(content) {
        this.messages[this.messages.length - 1].content = content
    }

    getLastAssistantMessage() {
        return this.messages[this.messages.length - 1]
    }
}