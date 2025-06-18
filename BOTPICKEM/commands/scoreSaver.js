// commands/scoreSaver.js

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('save_scores')
    .setDescription('Zapisz aktualne wyniki do pliku backup.'),

  async execute(interaction) {
    const picksPath = path.join(__dirname, '..', 'picks.json');
    const backupPath = path.join(__dirname, '..', 'backups', `picks_backup_${Date.now()}.json`);

    try {
      if (!fs.existsSync(picksPath)) {
        return await interaction.reply({ content: 'Brak pliku picks.json do zapisania.', ephemeral: true });
      }

      if (!fs.existsSync(path.dirname(backupPath))) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      }

      fs.copyFileSync(picksPath, backupPath);

      await interaction.reply({
        content: `✅ Wyniki zostały zapisane do backupu: \`${path.basename(backupPath)}\``,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zapisu wyników.', ephemeral: true });
    }
  },
};
