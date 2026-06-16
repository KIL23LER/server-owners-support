import { pgTable, text, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  discordId: text("discord_id").primaryKey(),
  username: text("username").notNull(),
  globalName: text("global_name"),
  avatar: text("avatar"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("sessions", {
  token: text("token").primaryKey(),
  discordId: text("discord_id")
    .notNull()
    .references(() => usersTable.discordId, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminsTable = pgTable("admins", {
  discordId: text("discord_id").primaryKey(),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  templateCode: text("template_code").notNull(),
  category: text("category").notNull().default("عام"),
  createdBy: text("created_by")
    .notNull()
    .references(() => usersTable.discordId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  featured: boolean("featured").default(false).notNull(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Admin = typeof adminsTable.$inferSelect;

