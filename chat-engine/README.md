# OpenRouter Chat Engine

Полноценный, чистый и расширяемый движок для работы с OpenRouter API  
Поддерживает: стриминг, tools (function calling), историю чатов, все параметры API

## Содержание
- [Установка](#установка)
- [Инициализация](#инициализация)
- [Создание и управление чатами](#создание-и-управление-чатами)
- [Отправка сообщений](#отправка-сообщений)
  - Без стриминга
  - Со стримингом (реал-тайм вывод)
- [Работа с Tools (Function Calling)](#работа-с-tools-function-calling)
  - Автоматический парсинг JS-функций
  - Ручная передача схемы
  - Обработка вызовов функций от модели
- [Полный список параметров API](#полный-список-параметров-api)
- [Получение списка моделей](#получение-списка-моделей)
- [Примеры полного цикла](#примеры-полного-цикла)

## Установка

```bash
npm install node-fetch dotenv
```
```
Создай файл .env в корне проекта:env

OPENROUTER_API_KEY=ключ
```

## Инициализация

```javascript
const ChatEngine = require('./chat-engine');

const engine = new ChatEngine(); // автоматически берёт ключ из .env
// или явно:
// const engine = new ChatEngine('sk-or-v1-...');
```

## Создание и управление чатами

```javascript
// Создать новый чат (можно задать system-промпт)
const chatId = engine.createChat({
  systemMessage: "Ты — полезный ассистент, отвечаешь только на русском языке."
});

// Или без system-сообщения
const chatId2 = engine.createChat();

// Получить всю историю сообщений
const history = engine.getChatHistory(chatId);
console.log(history);

// Очистить чат
engine.clearChat(chatId);
```

## Отправка сообщений

1. Обычный режим (без стриминга)
```javascript
const response = await engine.sendMessage(chatId, "Расскажи анекдот про программиста", {
  model: "deepseek/deepseek-chat-v3.1:free",
  temperature: 0.8,
  max_tokens: 500
});

console.log(response.content);
// → "Идёт программист по улице..."
```
Возвращает объект:js
```js
{
  content: string | null,
  toolCalls: array | null,     // если модель вызвала функции
  usage: { prompt_tokens, completion_tokens, total_tokens }
}
```
2. Стриминг (реал-тайм вывод)
```javascript
const stream = await engine.sendMessage(chatId, "Напиши длинную сказку про дракона", {
  stream: true,
  model: "deepseek/deepseek-chat-v3.1:free",
  temperature: 0.9
});

// Обработка потока
for await (const chunk of stream) {
  if (chunk.done) break;

  const delta = chunk.choices?.[0]?.delta;

  // Обычный текст
  if (delta?.content) {
    process.stdout.write(delta.content);
  }

  // Стриминговые tool_calls (редко, но бывает)
  if (delta?.tool_calls) {
    console.log("Tool call в стриме:", delta.tool_calls);
  }
}
```

## Работа с Tools (Function Calling)
Вариант A: Автоматический парсинг из JS-функции (рекомендуется)
```javascript
/** Получить текущую погоду в городе */
function get_weather(city) {
  /**
   * @param {string} city - Название города (например, "Moscow")
   * @returns {string} Погода в формате "Солнечно, +23°C"
   */
  // Здесь будет реальная логика (API и т.д.)
  return `В городе ${city} сейчас ясно, +22°C`;
}

/** Перевести деньги пользователю */
function transfer_money({ to, amount, currency }) {
  /**
   * @param {string} to - Ник или email получателя
   * @param {number} amount - Сумма
   * @param {string} [currency="USD"] - Валюта (по умолчанию USD)
   */
  console.log(`Переводим ${amount} ${currency} → ${to}`);
  return { success: true, transaction_id: "tx_12345" };
}

// Добавляем функции в движок (один раз)
engine.addTools([get_weather, transfer_money]);
```
Движок автоматически создаст правильный JSON для OpenRouter из JSDoc-комментариев и сигнатуры функции.

> [!WARNING]
> не все модели поддерживают инструменты, убедитесь, что модель способна на это

Вариант B: Ручная передача схемы
```javascript
const manualTool = {
  type: "function",
  function: {
    name: "search_database",
    description: "Поиск по внутренней базе знаний компании",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Поисковый запрос" },
        limit: { type: "integer", description: "Максимум результатов", default: 10 }
      },
      required: ["query"]
    }
  }
};

await engine.sendMessage(chatId, "Найди все заказы Иванова за 2024", {
  tools: [manualTool],           // переопределяет глобальные
  tool_choice: "auto"
});
```
Обработка вызовов функций от модели
```javascript
const response = await engine.sendMessage(chatId, "Какая погода в Санкт-Петербурге?");

if (response.toolCalls) {
  for (const toolCall of response.toolCalls) {
    const { name, arguments: argsStr } = toolCall.function;
    const args = JSON.parse(argsStr);

    let result;
    if (name === "get_weather") {
      result = get_weather(args.city);               // ← твоя функция
    } else if (name === "transfer_money") {
      result = transfer_money(args);
    }

    // Добавляем ответ функции в историю и продолжаем диалог
    engine.getChatHistory(chatId).push({
      role: "tool",
      tool_call_id: toolCall.id,
      name: name,
      content: JSON.stringify(result)
    });

    // Делаем второй запрос — модель даст финальный ответ
    const final = await engine.sendMessage(chatId, ""); // пустое сообщение = продолжить
    console.log("Ответ после функции:", final.content);
  }
}
```

## Полный список параметров API

Все параметры из официальной документации OpenRouter/OpenAI поддерживаются:
## Полный список параметров API

Все параметры из официальной документации OpenRouter/OpenAI поддерживаются:
```javascript
await engine.sendMessage(chatId, "Привет!", {
  model: "google/gemini-pro-1.5",
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.9,
  frequency_penalty: 0.5,
  presence_penalty: 0.3,
  stop: ["\n\n", "END"],
  stream: true,
  tools: [...],                    
  tool_choice: "auto" | "none" | { type: "function", function: { name: "..." } },
  response_format: { type: "json_object" },
  include_reasoning: true,
  // ... и любые другие поля из OpenAI spec
});

## Получение списка моделей

```javascript
const models = await ChatEngine.listModels(50);
console.log(models.data.map(m => `${m.id} — $${m.pricing.prompt}/1M токенов`));
```

## Примеры полного цикла

Полный пример с tool → выполнение → финальный ответ
```javascript
function get_user_balance(userId) {
  /** Возвращает баланс пользователя */
  return { userId, balance: 15420.50, currency: "RUB" };
}

engine.addTools(get_user_balance);

const chatId = engine.createChat({ systemMessage: "Ты — банковский ассистент." });

let res = await engine.sendMessage(chatId, "Сколько у меня денег на счёте?");

if (res.toolCalls) {
  const tc = res.toolCalls[0];
  const args = JSON.parse(tc.function.arguments);

  const result = get_user_balance(args.userId);

  // Добавляем ответ функции
  engine.getChatHistory(chatId).push({
    role: "tool",
    tool_call_id: tc.id,
    name: tc.function.name,
    content: JSON.stringify(result)
  });

  // Финальный запрос
  const final = await engine.sendMessage(chatId, "");
  console.log(final.content);
  // → "На вашем счёте 15 420,50 ₽"
}
```
```javascript
const response = await engine.sendMessage(chatId, "Решите уравнение x^2 + 3x - 4 = 0 шаг за шагом", {
  model: "deepseek/deepseek-r1",  // Модель с reasoning
  include_reasoning: true
});

console.log("Ответ:", response.content);
console.log("Размышления модели:", response.reasoning);  // ← Новое: traces шагов
// → "Размышления: 'Сначала факторизуем: (x+4)(x-1)=0, корни -4 и 1...'"
```

Для стриминга:
```javascript
// В стриминге reasoning приходит в delta.reasoning
for await (const chunk of stream) {
  if (chunk.choices?.[0]?.delta?.reasoning) {
    process.stdout.write(`[Размышление: ${chunk.choices[0].delta.reasoning}] `);
  }
  if (chunk.choices?.[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```
