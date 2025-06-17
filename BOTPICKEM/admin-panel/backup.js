const { SlashCommandBuilder } = require("discord.js");
const { createBackup, listBackups, restoreBackup } = require("../../utils/backup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backup")
    .setDescription("Zarządzaj kopiami zapasowymi (admin)")
    .addSubcommand(cmd =>
      cmd.setName("utworz").setDescription("Utwórz nowy backup"))
    .addSubcommand(cmd =>
      cmd.setName("lista").setDescription("Pokaż dostępne backupy"))
    .addSubcommand(cmd =>
      cmd.setName("przywroc")
        .setDescription("Przywróć dane z kopii")
        .addStringOption(opt =>
          opt.setName("folder").setDescription("Nazwa folderu z backupem").setRequired(true))),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({ content: "Brak uprawnień.", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "utworz") {
      const folder = createBackup();
      return interaction.reply({ content: `✅ Backup zapisany w folderze: \`${folder.split("/").pop()}\``, ephemeral: true });
    }

    if (sub === "lista") {
      const backups = listBackups();
      if (backups.length === 0) {
        return interaction.reply({ content: "Brak backupów.", ephemeral: true });
      }

      const list = backups.map(b => `📦 \`${b}\``).join("\n");
      return interaction.reply({ content: `Dostępne backupy:\n${list}`, ephemeral: true });
    }

    if (sub === "przywroc") {
      const folder = interaction.options.getString("folder");

      try {
        restoreBackup(folder);
        return interaction.reply({ content: `♻️ Backup \`${folder}\` został przywrócony.`, ephemeral: true });
      } catch (err) {
        return interaction.reply({ content: `❌ Błąd: ${err.message}`, ephemeral: true });
      }
    }
  }
};
