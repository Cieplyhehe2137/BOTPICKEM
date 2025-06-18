const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scorefullpickem')
    .setDescription('Zlicz punkty za pełne pickemy (2x 3-0, 2x 0-3, 6 awansów)'),

  async execute(interaction) {
    const actual = {
      "3-0": ["Navi", "G2"],
      "0-3": ["Monte", "9INE"],
      advance: ["Spirit", "Vitality", "FaZe", "VP", "Astralis", "Furia"]
    };

    const allPicks = pickemService.getAllPicks(); // { userId: { "3-0": [], "0-3": [], advance: [] } }

    const results = [];

    for (const [userId, picks] of Object.entries(allPicks)) {
      let score = 0;

      for (const team of picks["3-0"] || []) {
        if (actual["3-0"].includes(team)) score += 4;
      }

      for (const team of picks["0-3"] || []) {
        if (actual["0-3"].includes(team)) score += 4;
      }

      for (const team of picks.advance || []) {
        if (actual.advance.includes(team)) score += 2;
      }

      results.push({ user: `<@${userId}>`, score });
    }

    results.sort((a, b) => b.score - a.score);

    const table = results.map((r, i) => `${i + 1}. ${r.user} – **${r.score} pkt**`).join('\n');

    await interaction.reply({ content: `📊 **Wyniki Full Pick'em:**\n\n${table}`, ephemeral: false });
  }
};
