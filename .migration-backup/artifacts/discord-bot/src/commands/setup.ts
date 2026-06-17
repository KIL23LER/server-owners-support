import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  Colors,
} from "discord.js";
import { DEFAULT_CATEGORIES, DEFAULT_ROLES } from "../template-data.js";

export async function handleSetup(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "❌ هذا الأمر يعمل فقط داخل سيرفر.", ephemeral: true });
    return;
  }

  // تحقق من صلاحيات المستخدم
  const member = await guild.members.fetch(interaction.user.id);
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: "❌ تحتاج صلاحية **مدير السيرفر** لاستخدام هذا الأمر.",
      ephemeral: true,
    });
    return;
  }

  // تحقق من صلاحيات البوت
  const botMember = guild.members.me;
  if (!botMember?.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: "❌ البوت يحتاج صلاحية **مدير السيرفر** لإنشاء القنوات والرتب.",
      ephemeral: true,
    });
    return;
  }

  const totalChannels = DEFAULT_CATEGORIES.reduce((s, c) => s + c.channels.length, 0);

  // رسالة التأكيد
  const confirmEmbed = new EmbedBuilder()
    .setTitle("🛠️ تطبيق قالب Server Owners Support")
    .setDescription(
      `سيتم إنشاء التالي في سيرفرك:\n\n` +
      `📁 **${DEFAULT_CATEGORIES.length}** فئة\n` +
      `📌 **${totalChannels}** قناة\n` +
      `🎖️ **${DEFAULT_ROLES.length}** رتبة\n\n` +
      `⚠️ **لن يتم حذف أي شيء موجود مسبقاً.**\n\n` +
      `⚡ **بعد الانتهاء، البوت سيخرج من السيرفر تلقائياً.**\n\n` +
      `هل تريد المتابعة؟`
    )
    .setColor(Colors.Blurple)
    .setFooter({ text: "Server Owners Support • SOS" });

  const confirmBtn = new ButtonBuilder()
    .setCustomId("setup_confirm")
    .setLabel("✅ نعم، طبّق القالب")
    .setStyle(ButtonStyle.Success);

  const cancelBtn = new ButtonBuilder()
    .setCustomId("setup_cancel")
    .setLabel("❌ إلغاء")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmBtn, cancelBtn);

  const reply = await interaction.reply({
    embeds: [confirmEmbed],
    components: [row],
    ephemeral: true,
  });

  let collected;
  try {
    collected = await reply.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 30_000,
    });
  } catch {
    await interaction.editReply({ content: "⏰ انتهى وقت التأكيد.", embeds: [], components: [] });
    return;
  }

  if (collected.customId === "setup_cancel") {
    await collected.update({ content: "❌ تم الإلغاء.", embeds: [], components: [] });
    return;
  }

  await collected.update({
    content: "⏳ جاري تطبيق القالب...",
    embeds: [],
    components: [],
  });

  let errors = 0;
  let rolesCreated = 0;
  let channelsCreated = 0;
  let catsCreated = 0;

  // ── إنشاء الرتب ──────────────────────────────────────────────────────────────
  for (const roleData of DEFAULT_ROLES) {
    try {
      await guild.roles.create({
        name: roleData.name,
        color: roleData.color,
        hoist: roleData.hoist ?? false,
        mentionable: roleData.mentionable ?? false,
        reason: "تطبيق قالب SOS",
      });
      rolesCreated++;
    } catch {
      errors++;
    }
  }

  // ── إنشاء الفئات والقنوات ────────────────────────────────────────────────────
  for (const catData of DEFAULT_CATEGORIES) {
    let category;
    try {
      category = await guild.channels.create({
        name: catData.name,
        type: ChannelType.GuildCategory,
        reason: "تطبيق قالب SOS",
      });
      catsCreated++;
    } catch {
      errors++;
      continue;
    }

    for (const chData of catData.channels) {
      try {
        await guild.channels.create({
          name: `${chData.emoji}・${chData.name}`,
          type: chData.type === "voice" ? ChannelType.GuildVoice : ChannelType.GuildText,
          parent: category.id,
          reason: "تطبيق قالب SOS",
        });
        channelsCreated++;
      } catch {
        errors++;
      }
    }
  }

  // ── الرد النهائي ─────────────────────────────────────────────────────────────
  const doneEmbed = new EmbedBuilder()
    .setTitle(errors === 0 ? "✅ تم تطبيق القالب بنجاح!" : `⚠️ اكتمل مع ${errors} خطأ`)
    .setDescription(
      `**تم إنشاء:**\n` +
      `🎖️ ${rolesCreated} رتبة\n` +
      `📁 ${catsCreated} فئة\n` +
      `📌 ${channelsCreated} قناة\n\n` +
      `يمكنك تخصيص الإيموجيات والألوان من الموقع:\n` +
      `🎨 [server-owners-support.vercel.app/customize](https://server-owners-support.vercel.app/customize)\n\n` +
      `⚡ **البوت سيخرج من السيرفر الآن تلقائياً.**`
    )
    .setColor(errors === 0 ? Colors.Green : Colors.Yellow)
    .setTimestamp()
    .setFooter({ text: "Server Owners Support • SOS" });

  await interaction.editReply({ content: "", embeds: [doneEmbed], components: [] });

  // انتظر ثانيتين ثم اخرج من السيرفر
  setTimeout(async () => {
    try {
      await guild.leave();
      console.log(`👋 البوت خرج من السيرفر: ${guild.name}`);
    } catch (err) {
      console.error("خطأ عند الخروج من السيرفر:", err);
    }
  }, 2000);
}
