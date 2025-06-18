const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pickemService = require('../services/pickemServices');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export_groups_and_playoffs')
        .setDescription('Eksportuj dane z grup + playoffów z punktami'),

    async execute(interaction) {
        const actual = {
            advance: ["Navi", "G2", "Vitality", "Spirit", "VP", "Furia"],
            qf1: "Navi",
            qf2: "VP",
            sf1: "Navi",
            sf2: "Spirit",
            final: "Navi"
        };

        const allPicks = pickemService.getAllPicks();
        const rows = [];

        for (const [eventId, users] of Object.entries(allPicks)) {
            for (const [userId, picks] of Object.entries(users)) {
                let score = 0;

                for (const team of picks.advance || []) {
                    if (actual.advance.includes(team)) score += 2;
                }

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

        const exportPath = path.join(__dirname, '..', 'exports', 'groups_and_playoffs_export.xlsx');
        if (!fs.existsSync(path.dirname(exportPath))) {
            fs.mkdirSync(path.dirname(exportPath));
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Groups+Playoffs');
        XLSX.writeFile(workbook, exportPath);

        await interaction.reply({ content: '📤 Dane zapisane do `exports/groups_and_playoffs_export.xlsx`!', ephemeral: true });
    }
};
