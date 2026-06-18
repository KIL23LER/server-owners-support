import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  discordId: text("discord_id").primaryKey(),
  username: text("username").notNull(),
  globalName: text("global_name"),
  avatar: text("avatar"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  discordId: text("discord_id").notNull().references(() => usersTable.discordId, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminsTable = pgTable("admins", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  addedBy: text("added_by").notNull(),
  isOwner: boolean("is_owner").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  templateCode: text("template_code").notNull(),
  category: text("category").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by").notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const insertSessionSchema = createInsertSchema(sessionsTable);
export const insertAdminSchema = createInsertSchema(adminsTable);
export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSettingSchema = createInsertSchema(settingsTable);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type User = typeof usersTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Admin = typeof adminsTable.$inferSelect;
export type Template = typeof templatesTable.$inferSelect;
export type Setting = typeof settingsTable.$inferSelect;
