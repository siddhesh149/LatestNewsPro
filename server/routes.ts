import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAdmin } from "./auth";
import { storage } from "./storage";
import { insertCategorySchema, insertArticleSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API Routes - prefixed with /api
  
  // Error handling middleware for Zod validation
  const validateBody = (schema: z.ZodType<any, any>) => {
    return (req: any, res: any, next: any) => {
      try {
        req.validatedBody = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ message: validationError.message });
        } else {
          next(error);
        }
      }
    };
  };

  // Category routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:slug", async (req, res, next) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", isAdmin, validateBody(insertCategorySchema), async (req, res, next) => {
    try {
      const category = await storage.createCategory(req.validatedBody);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/categories/:id", isAdmin, validateBody(insertCategorySchema.partial()), async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      const updatedCategory = await storage.updateCategory(categoryId, req.validatedBody);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Article routes
  app.get("/api/articles", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const status = req.query.status as string | undefined;
      
      // Only allow admin to see non-published articles
      if (status && status !== 'published' && (!req.isAuthenticated() || !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized to access non-published articles" });
      }

      const articles = await storage.getArticles({ limit, offset, categoryId, status });
      const total = await storage.getArticleCount({ categoryId, status });
      
      res.json({ 
        articles,
        pagination: {
          total,
          limit,
          offset: offset || 0,
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/articles/featured", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const featuredArticles = await storage.getFeaturedArticles(limit);
      res.json(featuredArticles);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/articles/latest", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const latestArticles = await storage.getLatestArticles(limit, categoryId);
      res.json(latestArticles);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/articles/search", async (req, res, next) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const results = await storage.searchArticles(query, limit);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/articles/:slug", async (req, res, next) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Only allow admin to see non-published articles
      if (article.status !== 'published' && (!req.isAuthenticated() || !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized to access this article" });
      }
      
      res.json(article);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/articles", isAdmin, validateBody(insertArticleSchema), async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const articleData = {
        ...req.validatedBody,
        authorId: req.user.id,
      };
      
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/articles/:id", isAdmin, validateBody(insertArticleSchema.partial()), async (req, res, next) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getArticleById(articleId);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const updatedArticle = await storage.updateArticle(articleId, req.validatedBody);
      res.json(updatedArticle);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/articles/:id", isAdmin, async (req, res, next) => {
    try {
      const articleId = parseInt(req.params.id);
      await storage.deleteArticle(articleId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
