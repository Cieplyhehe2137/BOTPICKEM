// reminder.js

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log(`Reminder uruchomiony jako ${client.user.tag}`);
    startReminderLoop();
});

function startReminderLoop() {
    setInterval(() => {
        try {
            const deadlinePath = path.join(__dirname, 'data', 'deadline.json');
            if (!fs.existsSync(deadlinePath)) return;

            const deadlineData = JSON.parse(fs.readFileSync(deadlinePath, 'utf8'));
            if (!deadlineData.deadline) return;

            const deadline = new Date(deadlineData.deadline);
            const now = new Date();

            const diffMs = deadline - now;
            const diffHours = diffMs / 1000 / 60 / 60;

            if (diffHours <= 1 && diffHours > 0.98) {
                sendReminder();
            }
        } catch (err) {
            console.error('Błąd w reminder loop:', err);
        }
    }, 60 * 1000);
}

async function sendReminder() {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = guild.channels.cache.get(process.env.REMINDER_CHANNEL_ID);

    if (channel) {
        await channel.send('⏰ Uwaga! Deadline na oddanie typów mija za godzinę!');
    }
}

client.login(process.env.TOKEN);
