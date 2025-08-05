const { GoogleGenerativeAI } = require('@google/generative-ai');
const CrawledContent = require('../models/CrawledContent');
const config = require('../config/config');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateResponse(question, websiteId, userId) {
    try {
      const startTime = Date.now();

      // Get relevant content from the website
      const contents = await CrawledContent.find({ websiteId })
        .select('title content')
        .limit(5); // Limit to avoid token limits

      if (contents.length === 0) {
        return {
          answer: "I don't have any content from this website to answer your question. Please make sure the website has been crawled first.",
          responseTime: Date.now() - startTime,
          relevanceScore: 0
        };
      }

      // Combine content with a reasonable limit
      let context = '';
      let totalLength = 0;
      const maxContextLength = 8000; // Stay within token limits

      for (const content of contents) {
        const contentText = `Title: ${content.title}\nContent: ${content.content}\n\n`;
        if (totalLength + contentText.length > maxContextLength) break;
        context += contentText;
        totalLength += contentText.length;
      }

      // Create the prompt
      const prompt = `
        You are an AI assistant that answers questions based on website content. 
        Use only the following website content to answer the user's question. 
        If the answer cannot be found in the provided content, say so clearly.

        Website Content:
        ${context}

        Question: ${question}

        Please provide a helpful, accurate answer based only on the website content above. 
        If the question cannot be answered from the content, explain what information is missing.
        `;

      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      const responseTime = Date.now() - startTime;

      // Calculate a simple relevance score (you can make this more sophisticated)
      const relevanceScore = this.calculateRelevanceScore(question, answer, context);

      return {
        answer,
        responseTime,
        relevanceScore,
        aiModel: 'gemini-2.0-flash'
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      return {
        answer: "I'm sorry, I encountered an error while processing your question. Please try again later.",
        responseTime: 0,
        relevanceScore: 0,
        error: error.message
      };
    }
  }

  calculateRelevanceScore(question, answer, context) {
    // Simple relevance scoring based on keyword matching
    const questionWords = question.toLowerCase().split(/\s+/);
    const contextWords = context.toLowerCase().split(/\s+/);
    const answerWords = answer.toLowerCase().split(/\s+/);

    let matches = 0;
    for (const word of questionWords) {
      if (word.length > 3) { // Only consider words longer than 3 characters
        if (contextWords.includes(word) && answerWords.includes(word)) {
          matches++;
        }
      }
    }

    return Math.min(matches / Math.max(questionWords.length, 1), 1);
  }

  async getWebsitesSummary(websiteIds) {
    try {
      const summaries = [];
      
      for (const websiteId of websiteIds) {
        const content = await CrawledContent.findOne({ websiteId })
          .select('title content')
          .sort({ createdAt: -1 });

        if (content) {
          const prompt = `
Provide a brief 2-3 sentence summary of this website content:

Title: ${content.title}
Content: ${content.content.substring(0, 1000)}...

Summary:`;

          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          
          summaries.push({
            websiteId,
            summary: response.text()
          });
        }
      }

      return summaries;
    } catch (error) {
      console.error('Summary generation error:', error);
      return [];
    }
  }
}

module.exports = new AIService();