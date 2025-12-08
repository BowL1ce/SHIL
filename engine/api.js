import { OpenRouter } from '@openrouter/sdk';

export class Api {
    constructor(apiOptions = {}) {
        this.options = { ...apiOptions };
        this.options.tools = this.options.tools ?? [];

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

    async send(onStream, diffTime = 3000) {
        this.startTime = performance.now();
        this.loop = true;
        while (this.iteration < this.MAX_ITERATIONS && this.loop) {
            this.loop = false;

            const toolsMap = this.options.tools.map(tool => ({
                type: "function",
                function: {
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters
                }
            }));

            const body = {
                ...this.options,
                stream: true,
                tools: toolsMap.length ? toolsMap : undefined
            };

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY2}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    try {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            const parsed = JSON.parse(data);
                            const delta = parsed.choices[0]?.delta;

                            this.response.content += delta.content ?? "";
                            this.response.reasoning += delta.reasoning ?? "";

                            const toolCalls = delta.tool_calls || delta.toolCalls;
                            if (toolCalls?.length > 0) {
                                for (const tc of toolCalls) {
                                    const idx = tc.index ?? 0;
                                    if (!this.response.toolCalls[idx]) {
                                        this.response.toolCalls[idx] = { name: "", arguments: "" };
                                    }

                                    this.response.toolCalls[idx].name += tc.function.name ?? "";
                                    this.response.toolCalls[idx].arguments += tc.function.arguments ?? "";
                                }
                            }

                            if (performance.now() - this.startTime > diffTime) {
                                this.startTime = performance.now();
                                await onStream(this.response);
                            }
                        }
                    } catch {
                        console.log(lines);
                    }
                }
            }

            for (const [index, toolCall] of this.response.toolCalls.entries()) {
                if (this.response.toolCalls[index].result) continue;

                const tool = this.options.tools.find(t => t.function.name === toolCall.name);
                const args = JSON.parse(toolCall.arguments);
                const result = await tool.execute(args);
                this.response.toolCalls[index].result = result;

                if (tool.loop) this.loop = true;
            }

            if (this.loop) {
                this.options.messages.push({
                    role: this.response.role,
                    content: JSON.stringify(this.response.toolCalls.map(tool => ({
                        name: tool.name,
                        arguments: tool.arguments
                    })))
                });
                this.options.messages.push({
                    role: "user", // на сколько мне известно, не все модели поддерживают assistant как запрос, так что нет
                    content: JSON.stringify(this.response.toolCalls)
                });
            }

            this.iteration++;
        }

        return this.response;
    }
}