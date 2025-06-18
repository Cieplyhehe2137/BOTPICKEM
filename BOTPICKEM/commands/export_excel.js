const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export_excel')
        .setDescription('Eksportuj wszystkie typy do pliku Excel (.xlsx)'),

    async execute(interaction) {
        const picksPath = path.join(__dirname, '..', 'data', 'picks.json');
        const exportPath = path.join(__dirname, '..', 'exports', 'picks_export.xlsx');

        if (!fs.existsSync(picksPath)) {
            return interaction.reply({ content: 'Brak danych do eksportu!', ephemeral: true });
        }

        const picks = JSON.parse(fs.readFileSync(picksPath, 'utf8'));
        const rows = [];

        for (const [eventId, users] of Object.entries(picks)) {
            for (const [userId, pick] of Object.entries(users)) {
                const flatPick = { eventId, userId, ...pick };
                rows.push(flatPick);
            }
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Picks');

        if (!fs.existsSync(path.dirname(exportPath))) {
            fs.mkdirSync(path.dirname(exportPath));
        }

        XLSX.writeFile(workbook, exportPath);

        await interaction.reply({ content: '✅ Eksportowano dane do `exports/picks_export.xlsx`!', ephemeral: true });
    }
};
