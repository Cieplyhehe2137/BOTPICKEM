const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');
const ExcelJS = require('exceljs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_picks_groups_playoffs')
    .setDescription('Eksportuj typy Grupy + Playoffy'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Tylko administrator może użyć tej komendy!', ephemeral: true });
    }

    const allPicks = pickemService.getAllPicks();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Grupy + Playoffy Typy');

    sheet.columns = [
      { header: 'UserID', key: 'userId', width: 20 },
      { header: 'Advance', key: 'advance', width: 40 },
      { header: 'QF1', key: 'qf1', width: 20 },
      { header: 'QF2', key: 'qf2', width: 20 },
      { header: 'SF1', key: 'sf1', width: 20 },
      { header: 'SF2', key: 'sf2', width: 20 },
      { header: 'Final', key: 'final', width: 20 },
    ];

    for (const [userId, picks] of Object.entries(allPicks)) {
      const p = picks.groups_playoffs || {};
      sheet.addRow({
        userId,
        advance: p.advance ? p.advance.join(', ') : '',
        qf1: p.qf1 || '',
        qf2: p.qf2 || '',
        sf1: p.sf1 || '',
        sf2: p.sf2 || '',
        final: p.final || '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    await interaction.reply({
      files: [{ attachment: buffer, name: 'groups_playoffs_typy.xlsx' }],
      ephemeral: true,
    });
  },
};
