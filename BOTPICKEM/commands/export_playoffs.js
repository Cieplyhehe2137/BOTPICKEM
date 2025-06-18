const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const xlsx = require('xlsx');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export_playoffs')
        .setDescription('Eksportuj dane z typowania Single Elimination z punktami i wyślij plik'),

    async execute(interaction) {
        const actual = {
            qf1: "Navi",
            qf2: "G2",
            sf1: "Navi",
            sf2: "VP",
            final: "Navi"
        };

        const allPicks = pickemService.getAllPicks();
        const rows = [];

        for (const [eventId, users] of Object.entries(allPicks)) {
            for (const [userId, picks] of Object.entries(users)) {
                let score = 0;
                ['qf1', 'qf2', 'sf1', 'sf2', 'final'].forEach(key => {
                    if (picks[key] === actual[key]) score += 1;
                });

                rows.push({
                    eventId,
                    userId,
                    score,
                    ...picks
                });
            }
        }

        const exportPath = path.join(__dirname, '..', 'exports', 'playoffs_export.xlsx');
        if (!fs.existsSync(path.dirname(exportPath))) {
            fs.mkdirSync(path.dirname(exportPath));
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Playoffs');
        XLSX.writeFile(workbook, exportPath);

        await interaction.reply({
            content: '📤 Eksport zakończony! Plik zapisany jako `exports/playoffs_export.xlsx`',
            files: [exportPath],
            ephemeral: false
        });
    }
};
