// ✅ exportPicks.js – eksport typów do Excela (admin only)
const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');
const ExcelJS = require('exceljs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_picks')
    .setDescription('Eksportuj wszystkie typy do pliku Excel (tylko admin)'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Tylko administrator może użyć tej komendy!', ephemeral: true });
    }

    const allPicks = pickemService.getAllPicks(); // { userId: picks }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('PickEm Typy');

    // Nagłówki kolumn
    sheet.columns = [
      { header: 'UserID', key: 'userId', width: 20 },
      { header: '3-0', key: 'threeZero', width: 30 },
      { header: '0-3', key: 'zeroThree', width: 30 },
      { header: 'Advance', key: 'advance', width: 40 },
      { header: 'QF1', key: 'qf1', width: 20 },
      { header: 'QF2', key: 'qf2', width: 20 },
      { header: 'QF3', key: 'qf3', width: 20 },
      { header: 'QF4', key: 'qf4', width: 20 },
      { header: 'SF1', key: 'sf1', width: 20 },
      { header: 'SF2', key: 'sf2', width: 20 },
      { header: 'Final', key: 'final', width: 20 },
    ];

    // Wypełnianie danych
    for (const [userId, picks] of Object.entries(allPicks)) {
      const p = picks.full_plus_playoffs || {};

      sheet.addRow({
        userId,
        threeZero: p['3-0'] ? p['3-0'].join(', ') : '',
        zeroThree: p['0-3'] ? p['0-3'].join(', ') : '',
        advance: p.advance ? p.advance.join(', ') : '',
        qf1: p.qf1 || '',
        qf2: p.qf2 || '',
        qf3: p.qf3 || '',
        qf4: p.qf4 || '',
        sf1: p.sf1 || '',
        sf2: p.sf2 || '',
        final: p.final || '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    await interaction.reply({
      files: [{ attachment: buffer, name: 'pickem_typy.xlsx' }],
      ephemeral: true,
    });
  },
};
