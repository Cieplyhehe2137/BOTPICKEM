// ✅ score_groups_and_playoffs.js – scoring dla 6 awansów + 2 ćw., 2 pół., finał
const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('score_groups_and_playoffs')
    .setDescription('Zlicz punkty za typy grup + playoffy (2 ćw., 2 pół., 1 finał)'),

  async execute(interaction) {
    const actual = {
      advance: ['Navi', 'G2', 'Vitality', 'Spirit', 'VP', 'Furia'],
      qf1: 'Navi',
      qf2: 'VP',
      sf1: 'Navi',
      sf2: 'Spirit',
      final: 'Navi'
    };

    const allPicks = pickemService.getAllPicks();
    const results = [];

    for (const [userId, picks] of Object.entries(allPicks)) {
      let score = 0;

      for (const team of picks.advance || []) {
        if (actual.advance.includes(team)) score += 2;
      }

      ['qf1', 'qf2', 'sf1', 'sf2', 'final'].forEach(key => {
        if (picks[key] === actual[key]) score += 1;
      });

      results.push({ user: `<@${userId}>`, score });
    }

    results.sort((a, b) => b.score - a.score);
    const table = results.map((r, i) => `${i + 1}. ${r.user} – **${r.score} pkt**`).join('\n');
    await interaction.reply({ content: `📊 **Wyniki grup + playoffów:**\n\n${table}`, ephemeral: false });
  }
};
