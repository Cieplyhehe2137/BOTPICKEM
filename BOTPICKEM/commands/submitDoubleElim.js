// commands/submitDoubleElim.js

const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_doubleelim')
        .setDescription('Prześlij swoje typy na double elimination')
        .addStringOption(option => option.setName('upperfinal').setDescription('Upper Final (2 drużyny)').setRequired(true))
        .addStringOption(option => option.setName('lowerfinal').setDescription('Lower Final (2 drużyny)').setRequired(true))
        .addStringOption(option => option.setName('grandfinal').setDescription('Grand Final (zwycięzca)').setRequired(true)),

    async execute(interaction) {
        const deadline = deadlineService.loadDeadline();
        if (deadline && new Date() > deadline) {
            return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
        }

        const userId = interaction.user.id;
        const upperfinal = interaction.options.getString('upperfinal').split(',').map(e => e.trim());
        const lowerfinal = interaction.options.getString('lowerfinal').split(',').map(e => e.trim());
        const grandfinal = interaction.options.getString('grandfinal');

        if (upperfinal.length !== 2 || lowerfinal.length !== 2) {
            return interaction.reply({ content: 'Podaj dokładnie 2 drużyny na upper i 2 na lower final.', ephemeral: true });
        }

        const pickData = { upperfinal, lowerfinal, grandfinal };
        pickemService.submitPick(userId, 'doubleelim', pickData);
        await interaction.reply({ content: 'Twoje typy na Double Elim zostały zapisane!', ephemeral: true });
    }
};

const fs = require("fs");
const path = require("path");

function logPick({ userId, username, event, mode, picks }) {
  const logsPath = path.join(__dirname, "..", "data", "pick_logs.json");

  let logs = [];
  if (fs.existsSync(logsPath)) {
    logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));
  }

  logs.push({
    user_id: userId,
    username: username,
    event: event,
    mode: mode,
    timestamp: new Date().toISOString(),
    picks: picks
  });

  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}
