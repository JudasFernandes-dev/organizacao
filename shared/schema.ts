import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

export const transactionTypes = ["EXPENSE", "INCOME"] as const;
export type TransactionType = typeof transactionTypes[number];

export const transactionStatuses = ["PENDING", "PAID", "RECEIVED"] as const;
export type TransactionStatus = typeof transactionStatuses[number];

export const groupTypes = ["GROUP1", "GROUP2", "INCOME"] as const;
export type GroupType = typeof groupTypes[number];

export const paymentMethods = ["NUBANK", "INTER", "CASH", "OTHER"] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: transactionTypes }).notNull(),
  color: text("color").default("#6b21a8"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  type: true,
  color: true,
});

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: real("balance").default(0).notNull(),
  creditLimit: real("credit_limit").default(0),
  isCredit: integer("is_credit", { mode: "boolean" }).default(false).notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  name: true,
  type: true,
  balance: true,
  creditLimit: true,
  isCredit: true,
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date"),
  type: text("type", { enum: transactionTypes }).notNull(),
  status: text("status", { enum: transactionStatuses }).notNull().default("PENDING"),
  groupType: text("group_type", { enum: groupTypes }),
  paymentMethod: text("payment_method", { enum: paymentMethods }),
  categoryId: integer("category_id").references(() => categories.id),
  accountId: integer("account_id").references(() => accounts.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;