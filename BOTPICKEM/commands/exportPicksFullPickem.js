const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');
const ExcelJS = require('exceljs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_picks_full')
    .setDescription('Eksportuj typy Full PickEm (3-0, 0-3, awanse)'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Tylko administrator może użyć tej komendy!', ephemeral: true });
    }

    const allPicks = pickemService.getAllPicks();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Full PickEm Typy');

    sheet.columns = [
      { header: 'UserID', key: 'userId', width: 20 },
      { header: '3-0', key: 'threeZero', width: 30 },
      { header: '0-3', key: 'zeroThree', width: 30 },
      { header: 'Advance', key: 'advance', width: 40 },
    ];

    for (const [userId, picks] of Object.entries(allPicks)) {
      const p = picks.full || {};
      sheet.addRow({
        userId,
        threeZero: p['3-0'] ? p['3-0'].join(', ') : '',
        zeroThree: p['0-3'] ? p['0-3'].join(', ') : '',
        advance: p.advance ? p.advance.join(', ') : '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    await interaction.reply({
      files: [{ attachment: buffer, name: 'full_pickem_typy.xlsx' }],
      ephemeral: true,
    });
  },
};
