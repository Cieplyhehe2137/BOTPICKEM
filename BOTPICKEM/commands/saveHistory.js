// commands/saveHistory.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const pickemService = require('../services/pickemService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('save_history')
        .setDescription('Zapisz aktualne picki do historii (admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const picks = pickemService.getAllPicks();
        const historyPath = path.join(__dirname, '../data/history.json');

        let history = [];
        if (fs.existsSync(historyPath)) {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }

        history.push({
            date: new Date().toISOString(),
            picks
        });

        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
        await interaction.reply('✅ Historia została zapisana.');
    }
};
