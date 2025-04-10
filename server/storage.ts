import { users, categories, articles, type User, type InsertUser, type Category, type InsertCategory, type Article, type InsertArticle, type ArticleWithRelations } from "@shared/schema";
import { eq, desc, sql, and, like, isNull, count } from "drizzle-orm";
import { db } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { Pool } from "@neondatabase/serverless";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session
  sessionStore: session.SessionStore;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Articles
  getArticles(options?: { limit?: number, offset?: number, categoryId?: number, status?: string }): Promise<Article[]>;
  getArticleCount(options?: { categoryId?: number, status?: string }): Promise<number>;
  getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined>;
  getArticleById(id: number): Promise<ArticleWithRelations | undefined>;
  getFeaturedArticles(limit?: number): Promise<ArticleWithRelations[]>;
  getLatestArticles(limit?: number, categoryId?: number): Promise<ArticleWithRelations[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  searchArticles(query: string, limit?: number): Promise<ArticleWithRelations[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    // Use Postgres for session store in production, memory store in development
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      this.sessionStore = new PostgresSessionStore({ 
        pool,
        createTableIfMissing: true,
      });
    } else {
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Article methods
  async getArticles(options: { limit?: number, offset?: number, categoryId?: number, status?: string } = {}): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (options.categoryId) {
      query = query.where(eq(articles.categoryId, options.categoryId));
    }
    
    if (options.status) {
      query = query.where(eq(articles.status, options.status));
    } else {
      query = query.where(eq(articles.status, 'published'));
    }
    
    query = query.orderBy(desc(articles.publishedAt));
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    return query;
  }

  async getArticleCount(options: { categoryId?: number, status?: string } = {}): Promise<number> {
    let query = db.select({ count: count() }).from(articles);
    
    if (options.categoryId) {
      query = query.where(eq(articles.categoryId, options.categoryId));
    }
    
    if (options.status) {
      query = query.where(eq(articles.status, options.status));
    } else {
      query = query.where(eq(articles.status, 'published'));
    }
    
    const result = await query;
    return Number(result[0].count);
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined> {
    const result = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: {
        category: true,
        author: true,
      },
    });
    
    return result;
  }

  async getArticleById(id: number): Promise<ArticleWithRelations | undefined> {
    const result = await db.query.articles.findFirst({
      where: eq(articles.id, id),
      with: {
        category: true,
        author: true,
      },
    });
    
    return result;
  }

  async getFeaturedArticles(limit = 5): Promise<ArticleWithRelations[]> {
    const result = await db.query.articles.findMany({
      where: and(
        eq(articles.featured, true),
        eq(articles.status, 'published')
      ),
      with: {
        category: true,
        author: true,
      },
      limit,
      orderBy: desc(articles.publishedAt),
    });
    
    return result;
  }

  async getLatestArticles(limit = 10, categoryId?: number): Promise<ArticleWithRelations[]> {
    let whereCondition;
    
    if (categoryId) {
      whereCondition = and(
        eq(articles.status, 'published'),
        eq(articles.categoryId, categoryId)
      );
    } else {
      whereCondition = eq(articles.status, 'published');
    }
    
    const result = await db.query.articles.findMany({
      where: whereCondition,
      with: {
        category: true,
        author: true,
      },
      limit,
      orderBy: desc(articles.publishedAt),
    });
    
    return result;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updatedArticle] = await db
      .update(articles)
      .set({
        ...article,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    await db.delete(articles).where(eq(articles.id, id));
    return true;
  }

  async searchArticles(query: string, limit = 10): Promise<ArticleWithRelations[]> {
    const searchTerm = `%${query}%`;
    
    const result = await db.query.articles.findMany({
      where: and(
        eq(articles.status, 'published'),
        sql`${articles.title} ILIKE ${searchTerm} OR ${articles.content} ILIKE ${searchTerm}`
      ),
      with: {
        category: true,
        author: true,
      },
      limit,
      orderBy: desc(articles.publishedAt),
    });
    
    return result;
  }
}

// Create and export an instance of the storage implementation
export const storage = new DatabaseStorage();
