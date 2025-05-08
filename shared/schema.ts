import { pgTable, text, serial, integer, decimal, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Transaction types
export const transactionTypes = ["EXPENSE", "INCOME"] as const;
export type TransactionType = typeof transactionTypes[number];

// Transaction statuses
export const transactionStatuses = ["PENDING", "PAID", "RECEIVED"] as const;
export type TransactionStatus = typeof transactionStatuses[number];

// Group types
export const groupTypes = ["GROUP1", "GROUP2", "INCOME"] as const;
export type GroupType = typeof groupTypes[number];

// Payment methods
export const paymentMethods = ["NUBANK", "INTER", "CASH", "OTHER"] as const;
export type PaymentMethod = typeof paymentMethods[number];

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().$type<TransactionType>(),
  color: text("color").default("#6b21a8"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  type: true,
  color: true,
});

// Accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  isCredit: boolean("is_credit").default(false).notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  name: true,
  type: true,
  balance: true,
  creditLimit: true,
  isCredit: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  type: text("type").notNull().$type<TransactionType>(),
  status: text("status").notNull().$type<TransactionStatus>().default("PENDING"),
  groupType: text("group_type").$type<GroupType>(),
  paymentMethod: text("payment_method").$type<PaymentMethod>(),
  categoryId: integer("category_id").references(() => categories.id),
  accountId: integer("account_id").references(() => accounts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Define relations
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

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
