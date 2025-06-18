// commands/reminder.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Wyślij przypomnienie o deadlinie do typowania'),

  async execute(interaction) {
    await interaction.reply({
      content: '⏰ Przypomnienie: Nie zapomnij o typowaniu przed deadlinem!',
      ephemeral: true,
    });
  },
};
