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
                await onStream({ ...this.response });
            }
        }

        let i = 0;
        for (const tool in this.response.toolCalls) {
            const originalTool = tools.find(t => t.function.name === toolCall.name);
            const args = JSON.parse(tool.arguments);

            const result = await originalTool.execute(args);
            this.response.toolCalls[i].result = result
            i++;
        }

        await onFinal(this.response);
    }
}