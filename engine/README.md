# OPENROUTER CHATBOT ENGINE

задача была создать максимально простой движок, который будет исопльзовать модель как оператора, а всю остальную логику возьмет на себя, что бы не платить провайдеру за банальную хрень

так движок и работает, но я решил вообще ебнутся и сделать систему итераций, вам не нужно знать что это, она сделанна так чтобы не влиять на использование из вне, модель может выполнить хоть deep research и ко всему этому добавить еще выполение пайтон кода если захочет, но в моем случае это будет практически бесплатно

## основы
**формат ответа**
```js
response = {
    content: "",
    reasoning: "",
    role: "assistant",
    toolCalls: [
        {
            name: "string",
            arguments: "stringfy json",
            result: "any"
        }
    ]
};
```

**пример**
```js
const chat = new Chat();
await chat.send(
    "привет",
    async (response) => {  // onStream
        // в этом движке нет понятия delta, response это аккамулятор
    },
    async (response) => {  // onFinal
        console.log(response);
    }
);

```

**интрументы**

в основном тут все соответствует openrouter, только есть 2 доп ключа:
- execude - обязательный ключ, сама функция
- loop - выше я упомянул итерации, loop булевое значение, если вы используете loop результат функции отправится модели

```js
await chat.send(
    "привет",
    async (response) => {  // onStream
        // в этом движке нет понятия delta, response это аккамулятор
    },
    async (response) => {  // onFinal
        console.log(response);
    },
    [
        {
            type: "function",
            function: {
                name: "web_search",
                description: "web search tool",
                parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
            },
            execute: async (args) => {
                return "";
            },
            loop: true
        }
    ]
);
```