const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logi")
    .setDescription("Podgląd typów użytkownika (dla adminów)")
    .addStringOption(option =>
      option.setName("event").setDescription("Nazwa wydarzenia").setRequired(true))
    .addUserOption(option =>
      option.setName("użytkownik").setDescription("Użytkownik do sprawdzenia").setRequired(true)),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({ content: "Nie masz uprawnień do tej komendy.", ephemeral: true });
    }

    const event = interaction.options.getString("event");
    const user = interaction.options.getUser("użytkownik");

    const logsPath = path.join(__dirname, "..", "..", "data", "pick_logs.json");

    if (!fs.existsSync(logsPath)) {
      return interaction.reply("Brak logów typów.");
    }

    const logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));
    const userLogs = logs.filter(
      log => log.user_id === user.id && log.event === event
    );

    if (userLogs.length === 0) {
      return interaction.reply(`Brak typów użytkownika **${user.username}** dla wydarzenia **${event}**.`);
    }

    let output = `📄 **Historia typów użytkownika ${user.username}**\n`;
    output += `🧩 **Wydarzenie:** \`${event}\`\n`;
    output += `📊 Liczba typów: ${userLogs.length}\n\n`;

    for (const [i, log] of userLogs.entries()) {
      output += `#${i + 1} – 🕒 ${new Date(log.timestamp).toLocaleString()} – 🎯 Tryb: ${log.mode}\n`;
      for (const [key, value] of Object.entries(log.picks)) {
        if (Array.isArray(value)) {
          output += `• **${key}**: ${value.join(", ")}\n`;
        } else {
          output += `• **${key}**: ${value}\n`;
        }
      }
      output += `\n`;
    }

    await interaction.reply({ content: output, ephemeral: true });
  }
};
