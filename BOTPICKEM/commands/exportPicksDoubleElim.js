const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');
const ExcelJS = require('exceljs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_picks_doubleelim')
    .setDescription('Eksportuj typy Double Elimination'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Tylko administrator może użyć tej komendy!', ephemeral: true });
    }

    const allPicks = pickemService.getAllPicks();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Double Elimination Typy');

    sheet.columns = [
      { header: 'UserID', key: 'userId', width: 20 },
      { header: 'Upper Final 1', key: 'upper1', width: 20 },
      { header: 'Upper Final 2', key: 'upper2', width: 20 },
      { header: 'Lower Final 1', key: 'lower1', width: 20 },
      { header: 'Lower Final 2', key: 'lower2', width: 20 },
      { header: 'Grand Final 1', key: 'grand1', width: 20 },
      { header: 'Grand Final 2', key: 'grand2', width: 20 },
    ];

    for (const [userId, picks] of Object.entries(allPicks)) {
      const p = picks.doubleelim || {};
      sheet.addRow({
        userId,
        upper1: p.upper ? p.upper[0] || '' : '',
        upper2: p.upper ? p.upper[1] || '' : '',
        lower1: p.lower ? p.lower[0] || '' : '',
        lower2: p.lower ? p.lower[1] || '' : '',
        grand1: p.grand ? p.grand[0] || '' : '',
        grand2: p.grand ? p.grand[1] || '' : '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    await interaction.reply({
      files: [{ attachment: buffer, name: 'doubleelim_typy.xlsx' }],
      ephemeral: true,
    });
  },
};
