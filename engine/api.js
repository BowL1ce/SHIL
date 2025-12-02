import { OpenRouter } from '@openrouter/sdk';
import { Timer } from "./timer.js"

export class Api {
    constructor(apiOptions = {}) {
        this.openRouter = new OpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY
        });

        this.options = { ...apiOptions };
        this.timer = new Timer();
    }

    async send(onStream, onFinal) {
        console.log(1);
        const sendOptions = {
            ...this.options,
            stream: true,
            streamOptions: { includeUsage: true }
        };
        console.log(2);
        const stream = await this.openRouter.chat.send(sendOptions);
        console.log(3);
        for await (const chunk of stream) {
            console.log(4);
            await onStream(chunk.choices[0].delta)
            // if (this.timer.elapsedMillis() > 3000) {
            //     console.log(5);
            //     this.timer.reset();
            //     console.log(6);
            //     await onStream(chunk);
            //     console.log(7);
            // }
        }

        await onFinal("TODO");
    }
}