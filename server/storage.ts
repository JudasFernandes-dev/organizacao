import { 
  users, 
  accounts, 
  categories, 
  transactions, 
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type TransactionStatus,
  type TransactionType,
  type GroupType,
  type PaymentMethod
} from "@shared/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { db } from "./db";

// Define a interface de armazenamento
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Accounts
  getAllAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  updateTransactionStatus(id: number, status: TransactionStatus): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;
}

// Implementação do armazenamento usando banco de dados
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Categories
  async getAllCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    try{
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category || undefined;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error("Failed to fetch category");
    }
  }
  
  async createCategory(insertCategory: typeof newCategory): Promise<Category> {
    try {
      const [category] = await db
        .insert(categories)
        .values(insertCategory)
        .returning();
      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }
  
  // Accounts
  async getAllAccounts(): Promise<Account[]> {
    try {
      return await db.select().from(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw new Error("Failed to fetch accounts");
    }
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    try {
      const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
      return account || undefined;
    } catch (error) {
      console.error("Error fetching account:", error);
      throw new Error("Failed to fetch account");
    }
  }
  
  async createAccount(insertAccount: typeof newAccount): Promise<Account> {
    try {
      const [account] = await db
        .insert(accounts)
        .values(insertAccount)
        .returning();
      return account;
    } catch (error) {
      console.error("Error creating account:", error);
      throw new Error("Failed to create account");
    }
  }
  
  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions).orderBy(desc(transactions.date));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
      return transaction || undefined;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw new Error("Failed to fetch transaction");
    }
  }
  
  async createTransaction(insertTransaction: typeof newTransaction): Promise<Transaction> {
    try {
      const [transaction] = await db
        .insert(transactions)
        .values(insertTransaction)
        .returning();
      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }
  
  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db
        .update(transactions)
        .set({ status })
        .where(eq(transactions.id, id))
        .returning();
      return transaction || undefined;
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw new Error("Failed to update transaction status");
    }
  }
  
  async updateTransaction(id: number, transactionData: typeof updateTransactionType): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db
        .update(transactions)
        .set(transactionData)
        .where(eq(transactions.id, id))
        .returning();
      return transaction || undefined;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw new Error("Failed to update transaction");
    }
  }
  
  async deleteTransaction(id: number): Promise<void> {
    try {
      await db.delete(transactions).where(eq(transactions.id, id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw new Error("Failed to delete transaction");
    }
  }
}

export const storage = new DatabaseStorage();