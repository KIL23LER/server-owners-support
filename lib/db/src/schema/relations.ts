import { relations } from "drizzle-orm";
import { usersTable, sessionsTable, adminsTable, templatesTable } from "./index.js";

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  templates: many(templatesTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.discordId],
    references: [usersTable.discordId],
  }),
}));

export const templatesRelations = relations(templatesTable, ({ one }) => ({
  creator: one(usersTable, {
    fields: [templatesTable.createdBy],
    references: [usersTable.discordId],
  }),
}));

export const adminsRelations = relations(adminsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [adminsTable.discordId],
    references: [usersTable.discordId],
  }),
}));
