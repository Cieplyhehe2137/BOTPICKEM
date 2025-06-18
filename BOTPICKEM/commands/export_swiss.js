const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const xlsx = require('xlsx');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('export_swiss')
        .setDescription('Eksportuj dane z typowania Swiss (3-0, 0-3, awanse) z punktami'),

    async execute(interaction) {
        const actual = {
            "3_0": "G2",
            "0_3": "OG",
            advance: ["Navi", "Furia", "VP", "Mouz", "G2", "Spirit"]
        };

        const allPicks = pickemService.getAllPicks();
        const rows = [];

        for (const [eventId, users] of Object.entries(allPicks)) {
            for (const [userId, picks] of Object.entries(users)) {
                let score = 0;
                if (picks["3_0"] === actual["3_0"]) score += 4;
                if (picks["0_3"] === actual["0_3"]) score += 4;

                for (const team of picks.advance || []) {
                    if (actual.advance.includes(team)) score += 2;
                }

                rows.push({
                    eventId,
                    userId,
                    score,
                    ...picks
                });
            }
        }

        const exportPath = path.join(__dirname, '..', 'exports', 'swiss_export.xlsx');
        if (!fs.existsSync(path.dirname(exportPath))) {
            fs.mkdirSync(path.dirname(exportPath));
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Swiss');
        XLSX.writeFile(workbook, exportPath);

        await interaction.reply({ content: '📤 Dane zapisane do `exports/swiss_export.xlsx`!', ephemeral: true });
    }
};
