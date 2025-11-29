const { SlashCommandBuilder } = require('discord.js');
import chats from './index.js';

module.exports = {
	data: new SlashCommandBuilder().setName('clear_chat').setDescription('clear/delete your chat with bot'),
	async execute(interaction) {
        chats.delete(interaction.user.id)
		await interaction.reply(
			`chat has been cleared`,
		);
	},
};