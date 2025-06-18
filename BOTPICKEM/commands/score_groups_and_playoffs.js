// commands/score_groups_and_playoffs.js

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const picksPath = path.join(__dirname, '..', 'data', 'picks.json');
const resultsPath = path.join(__dirname, '..', 'data', 'results_groups_and_playoffs.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('score_groups_and_playoffs')
    .setDescription('Policz punkty za grupy A/B oraz playoffy'),

  async execute(interaction) {
    if (!fs.existsSync(picksPath) || !fs.existsSync(resultsPath)) {
      return interaction.reply({ content: 'Brakuje pliku z typami lub wynikami!', ephemeral: true });
    }

    const picksData = JSON.parse(fs.readFileSync(picksPath));
    const results = JSON.parse(fs.readFileSync(resultsPath));

    const eventName = 'groups_and_playoffs';
    const picks = picksData[eventName];

    if (!picks) {
      return interaction.reply({ content: 'Brak typów dla tego wydarzenia!', ephemeral: true });
    }

    const scoreboard = [];

    for (const userId in picks) {
      const pick = picks[userId];
      let score = 0;

      // GRUPA A
      ['opening', 'upper_sf', 'upper_final', 'lower_r1', 'lower_sf', 'lower_final'].forEach((round, index) => {
        const roundPicks = pick.groupA?.[round] || [];
        const roundResults = results.groupA?.[round] || [];
        const points = [1, 2, 3, 2, 2, 3][index];
        roundPicks.forEach((team, i) => {
          if (team === roundResults[i]) score += points;
        });
      });

      // GRUPA B
      ['opening', 'upper_sf', 'upper_final', 'lower_r1', 'lower_sf', 'lower_final'].forEach((round, index) => {
        const roundPicks = pick.groupB?.[round] || [];
        const roundResults = results.groupB?.[round] || [];
        const points = [1, 2, 3, 2, 2, 3][index];
        roundPicks.forEach((team, i) => {
          if (team === roundResults[i]) score += points;
        });
      });

      // Single Elimination Bracket
      if (pick.singleElim.qf1 === results.singleElim.qf1) score += 3;
      if (pick.singleElim.qf2 === results.singleElim.qf2) score += 3;
      if (pick.singleElim.sf1 === results.singleElim.sf1) score += 4;
      if (pick.singleElim.sf2 === results.singleElim.sf2) score += 4;
      if (pick.singleElim.final === results.singleElim.final) score += 5;

      scoreboard.push({ userId, score });
    }

    scoreboard.sort((a, b) => b.score - a.score);

    const resultText = scoreboard.map((entry, index) =>
      `**${index + 1}.** <@${entry.userId}> — **${entry.score} pkt**`
    ).join('\n');

    return interaction.reply({ content: `📊 **Wyniki grup i playoffów:**\n\n${resultText}`, ephemeral: false });
  }
};
