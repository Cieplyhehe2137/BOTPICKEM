// ✅ scoreFullPlusPlayoffs.js – scoring 3-0, 0-3, awanse + playoffy
const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scorefullplusplayoffs')
    .setDescription('Zlicz punkty za 3-0, 0-3, awanse + playoffy'),

  async execute(interaction) {
    const actual = {
      '3-0': ['Spirit', 'G2'],
      '0-3': ['HOTU', 'Monte'],
      advance: ['Navi', 'G2', 'Spirit', 'Vitality', 'VP', 'Furia'],
      qf1: 'Navi', qf2: 'VP', qf3: 'G2', qf4: 'Spirit',
      sf1: 'Navi', sf2: 'Spirit',
      final: 'Navi'
    };

    const allPicks = pickemService.getAllPicks();
    const results = [];

    for (const [userId, picks] of Object.entries(allPicks)) {
      const p = picks.full_plus_playoffs;
      if (!p) continue;
      let score = 0;

      p['3-0']?.forEach(team => { if (actual['3-0'].includes(team)) score += 4; });
      p['0-3']?.forEach(team => { if (actual['0-3'].includes(team)) score += 4; });
      p.advance?.forEach(team => { if (actual.advance.includes(team)) score += 2; });

      ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'final'].forEach(k => {
        if (p[k] === actual[k]) score += 1;
      });

      results.push({ user: `<@${userId}>`, score });
    }

    results.sort((a, b) => b.score - a.score);
    const table = results.map((r, i) => `${i + 1}. ${r.user} – **${r.score} pkt**`).join('\n');

    await interaction.reply({ content: `📊 **Wyniki Full + Playoffs:**\n\n${table}`, ephemeral: false });
  }
};
