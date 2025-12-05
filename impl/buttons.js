import { chats } from "../index.js";

export async function toggleReasoning(inter) {
    const chat = chats[inter.user.id]?.chat
    
    if (!chat) {
        await inter.reply({
        content: "chat not found",
        ephemeral: true
        })
        return;
    }

    chat.reasoning = !chat.reasoning;

    await inter.reply({
        content: chat.reasoning ? "reasoning enabled" : "reasoning disabled",
        ephemeral: true
    })
}

export async function clearChat(inter) {
    const chat = chats[inter.user.id]?.chat
    
    if (!chat) {
        await inter.reply({
        content: "chat not found",
        ephemeral: true
        })
        return;
    }

    delete chats[inter.user.id]

    await inter.reply({
        content: "chat deleted",
        ephemeral: true
    })
}