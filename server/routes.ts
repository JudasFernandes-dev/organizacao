import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertCategorySchema, 
  insertAccountSchema,
  transactionTypes,
  transactionStatuses,
  groupTypes,
  paymentMethods
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validation schemas
  const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(category);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Accounts
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const account = insertAccountSchema.parse(req.body);
      const newAccount = await storage.createAccount(account);
      res.status(201).json(newAccount);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account ID" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transaction = insertTransactionSchema.parse(req.body);
      const newTransaction = await storage.createTransaction(transaction);
      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction ID" });
    }
  });

  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const statusSchema = z.object({
        status: z.enum(transactionStatuses),
      });
      
      const { status } = statusSchema.parse(req.body);
      const updatedTransaction = await storage.updateTransactionStatus(id, status);
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid data for status update" });
    }
  });
  
  // Atualizar uma transação completa
  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      
      // Busca a transação atual para verificar se existe
      const existingTransaction = await storage.getTransaction(id);
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Valida e processa os dados da requisição
      const updateSchema = insertTransactionSchema.partial();
      const transactionUpdate = updateSchema.parse(req.body);
      
      // Atualiza a transação
      const updatedTransaction = await storage.updateTransaction(id, transactionUpdate);
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(400).json({ message: "Invalid transaction data for update" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await storage.deleteTransaction(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete transaction" });
    }
  });

  // Dashboard summary
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      
      // Calculate current balance
      const currentBalance = transactions.reduce((acc, transaction) => {
        if (transaction.status === "PAID" || transaction.status === "RECEIVED") {
          return transaction.type === "INCOME" 
            ? acc + Number(transaction.amount) 
            : acc - Number(transaction.amount);
        }
        return acc;
      }, 0);
      
      // Calculate income
      const income = transactions
        .filter(t => t.type === "INCOME")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      // Calculate expenses
      const expenses = transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      // Calculate remaining balance
      const remainingBalance = currentBalance + (income - expenses);
      
      res.json({
        currentBalance,
        income,
        expenses,
        remainingBalance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Initialize with default data
  await initializeData();
  
  const httpServer = createServer(app);
  return httpServer;
}

async function initializeData() {
  try {
    // Check if we have categories
    const categories = await storage.getAllCategories();
    
    if (categories.length === 0) {
      // Create default categories
      await storage.createCategory({ name: "Moradia", type: "EXPENSE", color: "#ef4444" });
      await storage.createCategory({ name: "Utilidades", type: "EXPENSE", color: "#f97316" });
      await storage.createCategory({ name: "Educação", type: "EXPENSE", color: "#eab308" });
      await storage.createCategory({ name: "Transporte", type: "EXPENSE", color: "#84cc16" });
      await storage.createCategory({ name: "Alimentação", type: "EXPENSE", color: "#06b6d4" });
      await storage.createCategory({ name: "Lazer", type: "EXPENSE", color: "#8b5cf6" });
      await storage.createCategory({ name: "Salário", type: "INCOME", color: "#4ade80" });
      await storage.createCategory({ name: "Freelance", type: "INCOME", color: "#22c55e" });
    }
    
    // Check if we have accounts
    const accounts = await storage.getAllAccounts();
    
    if (accounts.length === 0) {
      // Create default accounts
      await storage.createAccount({
        name: "Nubank", 
        type: "CREDIT_CARD", 
        balance: "0", 
        creditLimit: "2000",
        isCredit: true
      });
      
      await storage.createAccount({
        name: "Inter", 
        type: "CREDIT_CARD", 
        balance: "0", 
        creditLimit: "700",
        isCredit: true
      });
      
      await storage.createAccount({
        name: "Conta Corrente", 
        type: "CHECKING", 
        balance: "3042.81", 
        isCredit: false
      });
    }
    
    // Check if we have transactions
    const transactions = await storage.getAllTransactions();
    
    if (transactions.length === 0) {
      // Create sample transactions based on the design reference
      const utilidadesCategory = (await storage.getAllCategories()).find(c => c.name === "Utilidades")?.id || 1;
      const educacaoCategory = (await storage.getAllCategories()).find(c => c.name === "Educação")?.id || 3;
      const moradiaCategory = (await storage.getAllCategories()).find(c => c.name === "Moradia")?.id || 1;
      const salarioCategory = (await storage.getAllCategories()).find(c => c.name === "Salário")?.id || 7;
      
      const nubankAccount = (await storage.getAllAccounts()).find(a => a.name === "Nubank")?.id || 1;
      const interAccount = (await storage.getAllAccounts()).find(a => a.name === "Inter")?.id || 2;
      
      // Group 1 expenses
      await storage.createTransaction({
        description: "CELPE",
        amount: "229.43",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PENDING",
        groupType: "GROUP1",
        paymentMethod: "NUBANK",
        categoryId: utilidadesCategory,
        accountId: nubankAccount
      });
      
      await storage.createTransaction({
        description: "COMPESA",
        amount: "131.36",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PENDING",
        groupType: "GROUP1",
        paymentMethod: "NUBANK",
        categoryId: utilidadesCategory,
        accountId: nubankAccount
      });
      
      await storage.createTransaction({
        description: "CARTÃO INTER",
        amount: "1230.35",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 14).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PENDING",
        groupType: "GROUP1",
        paymentMethod: "INTER",
        categoryId: utilidadesCategory,
        accountId: interAccount
      });
      
      await storage.createTransaction({
        description: "PUÇANET",
        amount: "55.00",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 30).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PAID",
        groupType: "GROUP1",
        paymentMethod: "NUBANK",
        categoryId: utilidadesCategory,
        accountId: nubankAccount
      });
      
      await storage.createTransaction({
        description: "ESCOLA DE RAVI",
        amount: "165.00",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PAID",
        groupType: "GROUP1",
        paymentMethod: "NUBANK",
        categoryId: educacaoCategory,
        accountId: nubankAccount
      });
      
      // Group 2 expenses
      await storage.createTransaction({
        description: "ALUGUEL",
        amount: "800.00",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PENDING",
        groupType: "GROUP2",
        paymentMethod: "NUBANK",
        categoryId: moradiaCategory,
        accountId: nubankAccount
      });
      
      await storage.createTransaction({
        description: "PLANO DE RAVI",
        amount: "282.73",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PENDING",
        groupType: "GROUP2",
        paymentMethod: "INTER",
        categoryId: educacaoCategory,
        accountId: interAccount
      });
      
      await storage.createTransaction({
        description: "ANIV. MÃE DE RAFA",
        amount: "200.00",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
        type: "EXPENSE",
        status: "PENDING",
        groupType: "GROUP2",
        paymentMethod: "NUBANK",
        categoryId: utilidadesCategory,
        accountId: nubankAccount
      });
      
      // Income transactions
      await storage.createTransaction({
        description: "JUDAS",
        amount: "1473.35",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
        type: "INCOME",
        status: "PENDING",
        groupType: "INCOME",
        paymentMethod: "OTHER",
        categoryId: salarioCategory,
        accountId: null
      });
      
      await storage.createTransaction({
        description: "RAFAELA",
        amount: "1800.00",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
        type: "INCOME",
        status: "PENDING",
        groupType: "INCOME",
        paymentMethod: "OTHER",
        categoryId: salarioCategory,
        accountId: null
      });
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}
