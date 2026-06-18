import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL!);

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

export const db = drizzle(sql, {
  schema: { usersTable, sessionsTable, adminsTable, templatesTable, settingsTable },
});
