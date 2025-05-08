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
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

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
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values([insertCategory])
      .returning();
    return category;
  }
  
  // Accounts
  async getAllAccounts(): Promise<Account[]> {
    return await db.select().from(accounts);
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values([insertAccount])
      .returning();
    return account;
  }
  
  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(asc(transactions.date));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values([insertTransaction])
      .returning();
    return transaction;
  }
  
  async updateTransactionStatus(id: number, status: TransactionStatus): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }
  
  async updateTransaction(id: number, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(transactionData)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }
  
  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }
}

export const storage = new DatabaseStorage();