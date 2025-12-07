import { tavily } from "@tavily/core";

export const webSearch = {
    type: "function",
    function: {
        name: "web_search",
        description: "web search tool",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    },
    execute: async (args) => {
        let s = "";
        const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

        const response = await client.search(args.query);
        response.results.forEach(element => {
            s += `${element.url}: ${element.content}\n`;
        });

        return s;
    },
    loop: true
};

export const generateImage = {
    type: "function",
    function: {
        name: "generate_image",
        description: "generate the image using the api",
        parameters: { 
            type: "object", 
            properties: { 
                prompt: { type: "string", description: "prompt (only english)" }
            }, 
            required: ["prompt"] 
        }
    },
    execute: async (args) => {
        try {
            const response = await fetch('https://api.aimlapi.com/v1/images/generations', {
                method: 'POST',
                headers: {
                'Authorization': `Bearer ${process.env.AIMLAPI}`,
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                model: 'google/imagen-4.0-fast-generate-001',
                prompt: args.prompt,
                }),
            });

            const data = await response.json();
            return JSON.stringify(data, null, 2).data;
        } catch (e) {
            return `aimlapi error: ${e}`
        }
    },
    loop: true
};
