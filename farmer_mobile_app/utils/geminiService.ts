import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatAgent, ChatMessage } from '../types/chatAgent';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment variables.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.75,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 256, // Shorter responses
      },
    });
  }

  async generateResponse(
    agent: ChatAgent,
    userMessage: string,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Prepare the conversation history for context
      const conversationContext = this.buildConversationContext(chatHistory);
      
      // Create the full prompt with system instructions and context
      const fullPrompt = this.buildFullPrompt(agent, userMessage, conversationContext);
      
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  private buildConversationContext(chatHistory: ChatMessage[]): string {
    if (chatHistory.length === 0) return '';
    
    // Get the last 15 messages for better context (excluding the current user message)
    const recentMessages = chatHistory.slice(-15);
    
    // Build a more structured context with clear conversation flow
    const context = recentMessages
      .map((msg, index) => {
        const role = msg.isUser ? 'ගොවියා' : 'උපදේශක';
        return `${index + 1}. ${role}: ${msg.text}`;
      })
      .join('\n');
    
    return context ? `\n\n**සංවාද ඉතිහාසය:**\n${context}\n\n` : '';
  }

  private buildFullPrompt(agent: ChatAgent, userMessage: string, context: string): string {
    return `${agent.systemPrompt}

${context}**වර්තමාන ප්‍රශ්නය:** ${userMessage}

**වැදගත්:**
- සිංහලෙන් පමණක් පිළිතුරු දෙන්න
- කෙටි හා හිතවත් පිළිතුරු (2-3 වාක්‍ය)
- ප්‍රායෝගික උපදෙස්
- **සංවාද ඉතිහාසය සලකා බලන්න** - පෙර ප්‍රශ්න හා පිළිතුරු මතක තබාගන්න
- **ආයුබෝවන්, සුභ දිනයක් වේවා ආදී ආචාර කිරීම් නොකරන්න** - සෘජුවම පිළිතුරු දෙන්න
- **සිනහවෙන් නොව, හිතවත් ලෙස පිළිතුරු දෙන්න**
- ඉංග්‍රීසි නොමැත`;
  }

  // Method to validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      // First check if API key exists
      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        console.error('API key not configured');
        return false;
      }
      
      const result = await this.model.generateContent('Test message');
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  // Method to get available models
  async getAvailableModels(): Promise<string[]> {
    try {
      // This is a placeholder - you might want to implement model listing
      return ['gemini-1.5-flash', 'gemini-1.5-pro'];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  // Method to estimate token count (approximate)
  estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 0.75 words for English
    // For Sinhala, it might be different, but this is a rough estimate
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 1.33);
  }

  // Method to truncate conversation history if too long
  private truncateHistory(chatHistory: ChatMessage[], maxTokens: number = 2000): ChatMessage[] {
    let totalTokens = 0;
    const truncatedHistory: ChatMessage[] = [];
    
    // Start from the most recent messages
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const messageTokens = this.estimateTokenCount(chatHistory[i].text);
      if (totalTokens + messageTokens > maxTokens) {
        break;
      }
      totalTokens += messageTokens;
      truncatedHistory.unshift(chatHistory[i]);
    }
    
    return truncatedHistory;
  }
}

// Singleton instance
export const geminiService = new GeminiService();
