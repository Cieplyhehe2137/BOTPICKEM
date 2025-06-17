// commands/history.js

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Wyświetl historię zapisów picków'),

    async execute(interaction) {
        const historyPath = path.join(__dirname, '../data/history.json');

        if (!fs.existsSync(historyPath)) {
            return interaction.reply('Brak zapisanej historii.');
        }

        const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

        if (!history.length) {
            return interaction.reply('Brak zapisanej historii.');
        }

        let response = '**📜 Ostatnie zapisy historii:**\n\n';

        history.slice(-5).reverse().forEach(entry => {
            response += `🗓 ${entry.date}\n`;
            response += `- Liczba graczy: ${Object.keys(entry.picks).length}\n\n`;
        });

        await interaction.reply(response);
    }
};
