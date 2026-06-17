import { Client, GatewayIntentBits, Events, ActivityType } from "discord.js";
import "dotenv/config";
import { handleSetup } from "./commands/setup.js";
import { handleInfo } from "./commands/info.js";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN غير موجود.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ البوت شغّال كـ: ${c.user.tag}`);
  c.user.setActivity("Server Owners Support", { type: ActivityType.Watching });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case "setup-template":
        await handleSetup(interaction);
        break;
      case "info":
        await handleInfo(interaction);
        break;
    }
  } catch (err) {
    console.error("خطأ:", err);
    const msg = { content: "❌ حدث خطأ أثناء تنفيذ الأمر.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

// بعد ما البوت ينتهي من تطبيق القالب يخرج تلقائياً من السيرفر
client.on(Events.GuildCreate, async (guild) => {
  console.log(`📥 البوت دخل سيرفر: ${guild.name}`);
});

client.login(token);
