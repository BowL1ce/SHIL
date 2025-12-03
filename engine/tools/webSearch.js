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
