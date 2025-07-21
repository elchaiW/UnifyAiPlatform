import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { classifyRequest } from "./services/aiClassifier";
import { processWithClaude, analyzeDocument } from "./services/claudeService";
import { processWithChatGPT, summarizeContent } from "./services/openaiService";
import { processWithGemini, createMarketingStrategy, analyzeBusiness } from "./services/geminiService";
import { processWithGrok, debugCode, analyzeTechnicalDocument } from "./services/grokService";
import { extractTextFromFile, validateFileUpload } from "./services/documentProcessor";
import multer from 'multer';
import { insertRequestSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user for development - in production this would use proper authentication
  const demoUser = await storage.createUser({
    username: "demo",
    email: "demo@example.com",
    password: "demo123"
  });

  // Submit prompt for processing
  app.post("/api/requests/prompt", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Classify the request
      const startTime = Date.now();
      const classification = await classifyRequest(content);
      
      // Create request record
      const request = await storage.createRequest({
        userId: demoUser.id,
        type: 'prompt',
        content,
        category: classification.category,
        selectedModel: classification.model,
        fileName: null,
      });

      // Update status to processing
      await storage.updateRequestStatus(request.id, 'processing');

      // Process with appropriate AI model
      let response: string;
      try {
        switch (classification.model) {
          case 'claude':
            response = await processWithClaude(content);
            break;
          case 'chatgpt':
            response = await processWithChatGPT(content);
            break;
          case 'gemini':
            response = await processWithGemini(content);
            break;
          case 'grok':
            response = await processWithGrok(content);
            break;
          default:
            throw new Error(`Unknown model: ${classification.model}`);
        }

        const processingTime = (Date.now() - startTime) / 1000;
        
        // Update request with response
        await storage.updateRequestStatus(request.id, 'completed', response, processingTime);
        
        // Create analytics record
        await storage.createAnalytics({
          userId: demoUser.id,
          requestId: request.id,
          modelUsed: classification.model,
          responseTime: processingTime.toString(),
          success: true,
          errorType: null,
        });

        res.json({
          id: request.id,
          classification,
          response,
          processingTime,
          status: 'completed'
        });

      } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        const errorMessage = error instanceof Error ? error.message : 'Processing failed';
        
        await storage.updateRequestStatus(request.id, 'failed', `Error: ${errorMessage}`, processingTime);
        
        await storage.createAnalytics({
          userId: demoUser.id,
          requestId: request.id,
          modelUsed: classification.model,
          responseTime: processingTime.toString(),
          success: false,
          errorType: errorMessage,
        });

        res.status(500).json({ error: errorMessage });
      }

    } catch (error) {
      console.error('Request processing error:', error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Submit document for processing
  app.post("/api/requests/document", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file
      validateFileUpload(req.file);

      const startTime = Date.now();
      
      // Extract text from document
      const { text, metadata } = await extractTextFromFile(req.file.path, req.file.originalname);
      
      // Classify the document content
      const classification = await classifyRequest(text);
      
      // Create request record
      const request = await storage.createRequest({
        userId: demoUser.id,
        type: 'document',
        content: text,
        category: classification.category,
        selectedModel: classification.model,
        fileName: req.file.originalname,
      });

      // Update status to processing
      await storage.updateRequestStatus(request.id, 'processing');

      // Process with appropriate AI model using specialized document methods
      let response: string;
      try {
        switch (classification.model) {
          case 'claude':
            response = await analyzeDocument(text, req.file.originalname);
            break;
          case 'chatgpt':
            response = await summarizeContent(text, req.file.originalname);
            break;
          case 'gemini':
            response = await analyzeBusiness(text, req.file.originalname);
            break;
          case 'grok':
            response = await analyzeTechnicalDocument(text, req.file.originalname);
            break;
          default:
            throw new Error(`Unknown model: ${classification.model}`);
        }

        const processingTime = (Date.now() - startTime) / 1000;
        
        // Update request with response
        await storage.updateRequestStatus(request.id, 'completed', response, processingTime);
        
        // Create analytics record
        await storage.createAnalytics({
          userId: demoUser.id,
          requestId: request.id,
          modelUsed: classification.model,
          responseTime: processingTime.toString(),
          success: true,
          errorType: null,
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          id: request.id,
          classification,
          response,
          processingTime,
          metadata,
          status: 'completed'
        });

      } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        const errorMessage = error instanceof Error ? error.message : 'Processing failed';
        
        await storage.updateRequestStatus(request.id, 'failed', `Error: ${errorMessage}`, processingTime);
        
        await storage.createAnalytics({
          userId: demoUser.id,
          requestId: request.id,
          modelUsed: classification.model,
          responseTime: processingTime.toString(),
          success: false,
          errorType: errorMessage,
        });

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: errorMessage });
      }

    } catch (error) {
      console.error('Document processing error:', error);
      
      // Clean up uploaded file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: "Failed to process document" });
    }
  });

  // Get processing history
  app.get("/api/requests/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const requests = await storage.getUserRequests(demoUser.id, limit);
      res.json(requests);
    } catch (error) {
      console.error('History fetch error:', error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get analytics stats
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const [
        totalRequests,
        successRate,
        averageResponseTime,
        modelUsageStats
      ] = await Promise.all([
        storage.getTotalRequests(demoUser.id),
        storage.getSuccessRate(demoUser.id),
        storage.getAverageResponseTime(demoUser.id),
        storage.getModelUsageStats(demoUser.id)
      ]);

      // Convert modelUsageStats array to object format
      const modelUsageMap = { claude: 0, chatgpt: 0, gemini: 0, grok: 0 };
      if (Array.isArray(modelUsageStats)) {
        modelUsageStats.forEach(stat => {
          if (stat.model && stat.count) {
            modelUsageMap[stat.model as keyof typeof modelUsageMap] = stat.count;
          }
        });
      }

      res.json({
        totalRequests,
        successRate,
        avgProcessingTime: averageResponseTime,
        modelUsage: modelUsageMap
      });
    } catch (error) {
      console.error('Analytics stats fetch error:', error);
      res.status(500).json({ error: "Failed to fetch analytics stats" });
    }
  });

  // Get detailed analytics
  app.get("/api/analytics/detailed", async (req, res) => {
    try {
      const requests = await storage.getUserRequests(demoUser.id, 1000);
      const analytics = await storage.getUserAnalytics(demoUser.id);
      
      // Calculate model usage
      const modelUsage = { claude: 0, chatgpt: 0, gemini: 0, grok: 0 };
      const categoryBreakdown = { legal: 0, marketing: 0, coding: 0, general: 0 };
      const processingTimes: { [key: string]: { total: number, count: number } } = {};
      
      requests.forEach(req => {
        if (req.selectedModel) {
          modelUsage[req.selectedModel as keyof typeof modelUsage] = 
            (modelUsage[req.selectedModel as keyof typeof modelUsage] || 0) + 1;
        }
        
        if (req.category) {
          categoryBreakdown[req.category as keyof typeof categoryBreakdown] = 
            (categoryBreakdown[req.category as keyof typeof categoryBreakdown] || 0) + 1;
        }
        
        if (req.selectedModel && req.processingTime) {
          if (!processingTimes[req.selectedModel]) {
            processingTimes[req.selectedModel] = { total: 0, count: 0 };
          }
          processingTimes[req.selectedModel].total += parseFloat(req.processingTime);
          processingTimes[req.selectedModel].count += 1;
        }
      });
      
      const processingTimeStats = Object.entries(processingTimes).map(([model, data]) => ({
        model,
        avgTime: data.count > 0 ? data.total / data.count : 0,
        requestCount: data.count
      }));
      
      const successfulRequests = requests.filter(r => r.status === 'completed').length;
      const successRate = requests.length > 0 ? successfulRequests / requests.length : 0;
      const avgTime = processingTimeStats.reduce((acc, p) => acc + p.avgTime, 0) / Math.max(processingTimeStats.length, 1);

      res.json({
        totalRequests: requests.length,
        successRate,
        avgProcessingTime: avgTime,
        modelUsage,
        categoryBreakdown,
        processingTimes: processingTimeStats
      });
    } catch (error) {
      console.error('Detailed analytics fetch error:', error);
      res.status(500).json({ error: "Failed to fetch detailed analytics" });
    }
  });

  // Get request by ID
  app.get("/api/requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getRequest(id);
      
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error('Request fetch error:', error);
      res.status(500).json({ error: "Failed to fetch request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
