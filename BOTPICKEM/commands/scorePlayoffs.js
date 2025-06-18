const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs'); // ✅ tylko raz


module.exports = {
  data: new SlashCommandBuilder()
    .setName('scoreplayoffs')
    .setDescription('Zlicz punkty za typowanie playoffów'),

  async execute(interaction) {
    const actual = {
      qf1: 'Navi',
      qf2: 'Spirit',
      qf3: 'FaZe',
      qf4: 'VP',
      sf1: 'Navi',
      sf2: 'FaZe',
      final: 'Navi'
    };

    const allPicks = pickemService.getAllPicks();
    const results = [];

    for (const [userId, picks] of Object.entries(allPicks)) {
      let score = 0;
      for (const round of Object.keys(actual)) {
        if (picks[round] === actual[round]) score += 1;
      }
      results.push({ user: `<@${userId}>`, score });
    }

    results.sort((a, b) => b.score - a.score);
    const table = results.map((r, i) => `${i + 1}. ${r.user} – **${r.score}** pkt`).join('\n');

    await interaction.reply({ content: `🏆 Wyniki playoffów:\n\n${table}`, ephemeral: false });
  }
};
