// commands/submit_groups_and_playoffs.js

const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const deadlineService = require('../services/deadlineService');
const pickemService = require('../services/pickemService');

// Lista drużyn do wyboru (przykład — można rozbudować)
const teamChoices = [
  'NAVI', 'G2', 'Vitality', 'FaZe', 'Astralis', 'MOUZ', 'paiN', 'TheMongolz'
];

function teamOption(name, description) {
  const opt = new SlashCommandStringOption()
    .setName(name)
    .setDescription(description)
    .setRequired(true);
  teamChoices.forEach(team => opt.addChoices({ name: team, value: team }));
  return opt;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit_groups_and_playoffs')
    .setDescription('Prześlij swoje typy na grupy A/B oraz playoffy')
    // Grupa A
    .addStringOption(teamOption('a_match1', 'Grupa A: Mecz 1 zwycięzca'))
    .addStringOption(teamOption('a_match2', 'Grupa A: Mecz 2 zwycięzca'))
    .addStringOption(teamOption('a_match3', 'Grupa A: Mecz 3 zwycięzca'))
    .addStringOption(teamOption('a_match4', 'Grupa A: Mecz 4 zwycięzca'))
    .addStringOption(teamOption('a_upper_sf1', 'Grupa A: Upper semi-final 1'))
    .addStringOption(teamOption('a_upper_sf2', 'Grupa A: Upper semi-final 2'))
    .addStringOption(teamOption('a_upper_final', 'Grupa A: Upper final'))
    .addStringOption(teamOption('a_lower_r1_1', 'Grupa A: Lower round 1 mecz 1'))
    .addStringOption(teamOption('a_lower_r1_2', 'Grupa A: Lower round 1 mecz 2'))
    .addStringOption(teamOption('a_lower_sf1', 'Grupa A: Lower semi-final 1'))
    .addStringOption(teamOption('a_lower_sf2', 'Grupa A: Lower semi-final 2'))
    .addStringOption(teamOption('a_lower_final', 'Grupa A: Lower final'))

    // Grupa B
    .addStringOption(teamOption('b_match1', 'Grupa B: Mecz 1 zwycięzca'))
    .addStringOption(teamOption('b_match2', 'Grupa B: Mecz 2 zwycięzca'))
    .addStringOption(teamOption('b_match3', 'Grupa B: Mecz 3 zwycięzca'))
    .addStringOption(teamOption('b_match4', 'Grupa B: Mecz 4 zwycięzca'))
    .addStringOption(teamOption('b_upper_sf1', 'Grupa B: Upper semi-final 1'))
    .addStringOption(teamOption('b_upper_sf2', 'Grupa B: Upper semi-final 2'))
    .addStringOption(teamOption('b_upper_final', 'Grupa B: Upper final'))
    .addStringOption(teamOption('b_lower_r1_1', 'Grupa B: Lower round 1 mecz 1'))
    .addStringOption(teamOption('b_lower_r1_2', 'Grupa B: Lower round 1 mecz 2'))
    .addStringOption(teamOption('b_lower_sf1', 'Grupa B: Lower semi-final 1'))
    .addStringOption(teamOption('b_lower_sf2', 'Grupa B: Lower semi-final 2'))
    .addStringOption(teamOption('b_lower_final', 'Grupa B: Lower final'))

    // Single Elimination
    .addStringOption(teamOption('se_qf1', 'SE ćwierćfinał 1 zwycięzca'))
    .addStringOption(teamOption('se_qf2', 'SE ćwierćfinał 2 zwycięzca'))
    .addStringOption(teamOption('se_sf1', 'SE półfinał 1 zwycięzca'))
    .addStringOption(teamOption('se_sf2', 'SE półfinał 2 zwycięzca'))
    .addStringOption(teamOption('se_final', 'Zwycięzca finału SE')),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: '⛔ Deadline minął!', ephemeral: true });
    }

    const userId = interaction.user.id;

    const picks = {
      userId,
      groupA: {
        opening: [
          interaction.options.getString('a_match1'),
          interaction.options.getString('a_match2'),
          interaction.options.getString('a_match3'),
          interaction.options.getString('a_match4'),
        ],
        upper_sf: [
          interaction.options.getString('a_upper_sf1'),
          interaction.options.getString('a_upper_sf2'),
        ],
        upper_final: [interaction.options.getString('a_upper_final')],
        lower_r1: [
          interaction.options.getString('a_lower_r1_1'),
          interaction.options.getString('a_lower_r1_2')
        ],
        lower_sf: [
          interaction.options.getString('a_lower_sf1'),
          interaction.options.getString('a_lower_sf2')
        ],
        lower_final: [interaction.options.getString('a_lower_final')],
      },
      groupB: {
        opening: [
          interaction.options.getString('b_match1'),
          interaction.options.getString('b_match2'),
          interaction.options.getString('b_match3'),
          interaction.options.getString('b_match4'),
        ],
        upper_sf: [
          interaction.options.getString('b_upper_sf1'),
          interaction.options.getString('b_upper_sf2'),
        ],
        upper_final: [interaction.options.getString('b_upper_final')],
        lower_r1: [
          interaction.options.getString('b_lower_r1_1'),
          interaction.options.getString('b_lower_r1_2')
        ],
        lower_sf: [
          interaction.options.getString('b_lower_sf1'),
          interaction.options.getString('b_lower_sf2')
        ],
        lower_final: [interaction.options.getString('b_lower_final')],
      },
      singleElim: {
        qf1: interaction.options.getString('se_qf1'),
        qf2: interaction.options.getString('se_qf2'),
        sf1: interaction.options.getString('se_sf1'),
        sf2: interaction.options.getString('se_sf2'),
        final: interaction.options.getString('se_final')
      },
      timestamp: new Date().toISOString()
    };

    pickemService.saveUserPick('groups_and_playoffs', userId, picks);

    return interaction.reply({ content: '✅ Twoje typy zostały zapisane!', ephemeral: true });
  }
};
