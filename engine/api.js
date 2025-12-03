import { OpenRouter } from '@openrouter/sdk';

export class Api {
    constructor(apiOptions = {}) {
        this.openRouter = new OpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY2
        });
        this.options = { ...apiOptions };

        this.response = {
            content: "",
            reasoning: "",
            role: "assistant",
            toolCalls: []
        };

        this.startTime = 0;

        this.MAX_ITERATIONS = 6;
        this.iteration = 0;
        this.loop = false;
    }

    async send(onStream, onFinal, tools = []) {
        this.startTime = performance.now();

        const toolsMap = tools.map(tool => ({
            type: "function",
            function: {
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters
            }
        }));

        this.loop = true;
        while (this.iteration < this.MAX_ITERATIONS && this.loop) {
            this.loop = false;

            const sendOptions = {
                ...this.options,
                tools: toolsMap.length > 0 ? toolsMap : undefined,
                stream: true,
                streamOptions: { includeUsage: true }
            };

            const stream = await this.openRouter.chat.send(sendOptions);

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;

                this.response.content += delta.content ?? "";
                this.response.reasoning += delta.reasoning ?? "";

                const toolCalls = delta.toolCalls;
                if (toolCalls?.length > 0) {
                    for (const tc of toolCalls) {
                        const idx = tc.index;
                        const func = tc.function;
                        if (!this.response.toolCalls[idx]) this.response.toolCalls[idx] = { name: "", arguments: "" };
                        if (func?.name) this.response.toolCalls[idx].name += func.name;
                        if (func?.arguments) this.response.toolCalls[idx].arguments += func.arguments;
                    }
                }

                if (performance.now() - this.startTime > 3000) {
                    this.startTime = performance.now();
                    await onStream(this.response);
                }
            }

            for (const [index, toolCall] of this.response.toolCalls.entries()) {
                const tool = tools.find(t => t.function.name === toolCall.name);
                const args = JSON.parse(toolCall.arguments);
                const result = await tool.execute(args);
                this.response.toolCalls[index].result = result;

                if (tool.loop) this.loop = true;
            }

            if (this.loop) {
                this.apiOptions.messages.push({
                    role: this.response.role,
                    content: this.response.toolCalls.map(tool => ({
                        name: tool.name,
                        arguments: tool.arguments
                    })).toString()
                });
                this.apiOptions.messages.push({
                    role: "user",
                    content: this.response.toolCalls.toString()
                });
            }

            this.iteration++;
        }

        await onFinal(this.response);
    }
}