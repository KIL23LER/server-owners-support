import { REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_APPLICATION_ID;

if (!token || !clientId) {
  console.error("❌ تأكد من وجود DISCORD_BOT_TOKEN و DISCORD_APPLICATION_ID في ملف .env");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("setup-template")
    .setDescription("تطبيق قالب Server Owners Support على سيرفرك (قنوات + رتب)")
    .setDefaultMemberPermissions("8")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("معلومات عن بوت SOS")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(token);

console.log("⏳ جاري تسجيل أوامر الـ Slash Commands...");

try {
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log("✅ تم تسجيل الأوامر بنجاح!");
} catch (err) {
  console.error("❌ خطأ:", err);
}
