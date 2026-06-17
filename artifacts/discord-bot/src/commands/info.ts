import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";

export async function handleInfo(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("🤖 بوت Server Owners Support")
    .setDescription(
      "مرحباً! أنا بوت SOS المساعد لأصحاب السيرفرات العربية.\n\n" +
      "**الأوامر المتاحة:**\n" +
      "`/setup-template` — تطبيق قالب السيرفر الكامل (قنوات + رتب)\n" +
      "`/info` — معلومات عن البوت\n\n" +
      "**الموقع الرسمي:**\n" +
      "🌐 [server-owners-support.vercel.app](https://server-owners-support.vercel.app)\n\n" +
      "**تخصيص القالب:**\n" +
      "🎨 [server-owners-support.vercel.app/customize](https://server-owners-support.vercel.app/customize)"
    )
    .setColor(Colors.Blurple)
    .setFooter({ text: "Server Owners Support • SOS" })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
