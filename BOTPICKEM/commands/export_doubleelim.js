
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pickemService = require('../services/pickemServices');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export_doubleelim')
        .setDescription('Eksportuj dane z typowania Double Elimination z punktami'),

    async execute(interaction) {
        const actual = {"upperfinal": "Navi_vs_VP", "lowerfinal": "G2_vs_Furia", "grandfinal": "Navi"};

        const allPicks = pickemService.getAllPicks();
        const rows = [];

        for (const [eventId, users] of Object.entries(allPicks)) {
            for (const [userId, picks] of Object.entries(users)) {
                let score = 0;

                if (picks['upperfinal'] === actual['upperfinal']) score += 1;
                if (picks['lowerfinal'] === actual['lowerfinal']) score += 1;
                if (picks['grandfinal'] === actual['grandfinal']) score += 1;


                rows.push({
                    eventId,
                    userId,
                    score,
                    ...picks
                });
            }
        }

        const exportPath = path.join(__dirname, '..', 'exports', 'doubleelim_export.xlsx');

        if (!fs.existsSync(path.dirname(exportPath))) {
            fs.mkdirSync(path.dirname(exportPath));
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DoubleElim');
        XLSX.writeFile(workbook, exportPath);

        
        await interaction.reply({
            content: '📤 Eksport zakończony! Plik zapisany jako `' + exportPath + '`',
            files: [exportPath],
            ephemeral: false
        });

    }
};
