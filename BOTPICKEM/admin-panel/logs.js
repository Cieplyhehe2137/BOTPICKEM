const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logi")
    .setDescription("Podgląd typów użytkownika (dla adminów)")
    .addStringOption(option =>
      option.setName("event")
        .setDescription("Nazwa wydarzenia lub 'all' dla wszystkich")
        .setRequired(true))
    .addUserOption(option =>
      option.setName("użytkownik")
        .setDescription("Użytkownik do sprawdzenia")
        .setRequired(true)),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({ content: "Nie masz uprawnień do tej komendy.", ephemeral: true });
    }

    const event = interaction.options.getString("event");
    const user = interaction.options.getUser("użytkownik");
    const logsPath = path.join(__dirname, "..", "..", "data", "pick_logs.json");

    if (!fs.existsSync(logsPath)) {
      return interaction.reply("Brak pliku z logami.");
    }

    const logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));

    const userLogs = logs.filter(log =>
      log.user_id === user.id &&
      (event === "all" || log.event === event)
    );

    if (userLogs.length === 0) {
      return interaction.reply(`Brak typów użytkownika **${user.username}** dla "${event}".`);
    }

    let output = `📄 **Historia typów użytkownika ${user.username}**\n`;
    output += `🎯 Wydarzenie: \`${event === "all" ? "Wszystkie" : event}\`\n`;
    output += `📊 Liczba typów: ${userLogs.length}\n\n`;

    for (const [i, log] of userLogs.entries()) {
      output += `#${i + 1} – 🏆 ${log.event} – 🕒 ${new Date(log.timestamp).toLocaleString()} – 🎯 Tryb: ${log.mode}\n`;
      for (const [key, value] of Object.entries(log.picks)) {
        if (Array.isArray(value)) {
          output += `• **${key}**: ${value.join(", ")}\n`;
        } else {
          output += `• **${key}**: ${value}\n`;
        }
      }
      output += `\n`;
    }

    if (output.length > 2000) {
      return interaction.reply({ content: "⚠️ Za dużo danych – skróć zakres (np. wybierz konkretne wydarzenie).", ephemeral: true });
    }

    await interaction.reply({ content: output, ephemeral: true });
  }
};

