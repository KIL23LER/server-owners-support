export interface Channel {
  name: string;
  emoji: string;
  type: "text" | "voice";
}

export interface Category {
  name: string;
  channels: Channel[];
}

export interface Role {
  name: string;
  color: number;
  hoist?: boolean;
  mentionable?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    name: "📌 المعلومات",
    channels: [
      { name: "القوانين", emoji: "📋", type: "text" },
      { name: "الإعلانات", emoji: "📢", type: "text" },
      { name: "الترحيب", emoji: "👋", type: "text" },
      { name: "الرتب", emoji: "🎖️", type: "text" },
    ],
  },
  {
    name: "💬 العام",
    channels: [
      { name: "الدردشة", emoji: "💬", type: "text" },
      { name: "الصور والميديا", emoji: "🖼️", type: "text" },
      { name: "الروابط", emoji: "🔗", type: "text" },
      { name: "أوف توبيك", emoji: "🎭", type: "text" },
    ],
  },
  {
    name: "🛠️ الدعم",
    channels: [
      { name: "طلبات المساعدة", emoji: "❓", type: "text" },
      { name: "التذاكر", emoji: "🎫", type: "text" },
      { name: "الإبلاغ", emoji: "🚨", type: "text" },
    ],
  },
  {
    name: "🔊 الصوتيات",
    channels: [
      { name: "الغرفة العامة", emoji: "🎙️", type: "voice" },
      { name: "الموسيقى", emoji: "🎵", type: "voice" },
      { name: "المنتظرون", emoji: "💤", type: "voice" },
    ],
  },
];

export const DEFAULT_ROLES: Role[] = [
  { name: "المالك", color: 0xFFD700, hoist: true, mentionable: false },
  { name: "المدير التنفيذي", color: 0xFF6B6B, hoist: true, mentionable: true },
  { name: "المدير", color: 0xFF4757, hoist: true, mentionable: true },
  { name: "المشرف", color: 0x2ED573, hoist: true, mentionable: true },
  { name: "المساعد", color: 0x1E90FF, hoist: true, mentionable: true },
  { name: "العضو المميز", color: 0xA55EEA, hoist: true, mentionable: true },
  { name: "العضو", color: 0xB2BEC3, hoist: false, mentionable: false },
  { name: "الجديد", color: 0x636E72, hoist: false, mentionable: false },
];
