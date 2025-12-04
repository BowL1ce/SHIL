import {
  ChannelType,
  MessageType
} from 'discord.js';

export function botMentionedIn(client, message) {
  if (message.partial) return false;

  const botId = client.user.id;
  const content = message.content ?? '';

  if (message.mentions.has(botId)) return true;

  if (
    message.type === MessageType.Reply &&
    message.reference?.messageId
  ) {
    const repliedTo = message.channel.messages.cache.get(message.reference.messageId);
    if (repliedTo?.author.id === botId) return true;
  }

//   if (content.includes('@everyone') || content.includes('@here')) {
//     if (message.channel.type !== ChannelType.DM) return true;
//   }

  if (message.channel.type !== ChannelType.GuildText || message.channel.type === ChannelType.GuildVoice) {
    if (message.mentionRoles.some(roleId => {
      const member = message.guild?.members.cache.get(botId);
      return member?.roles.cache.has(roleId);
    })) {
      return true;
    }
  }

  if (content.includes(botId)) return true;

  // const botMember = message.guild?.members.cache.get(botId);
  // if (botMember && (content.includes(botMember.displayName) || content.includes(client.user.username))) {
  //   return true;
  // }

  return false;
}