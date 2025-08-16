import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatSession, ChatMessage } from '../types/chatAgent';

const CHAT_SESSIONS_KEY = 'chat_sessions';
const CHAT_MESSAGES_PREFIX = 'chat_messages_';

export class ChatStorageService {
  // Save a chat session
  async saveChatSession(session: ChatSession): Promise<void> {
    try {
      const sessions = await this.getChatSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      await AsyncStorage.setItem(
        `${CHAT_MESSAGES_PREFIX}${session.id}`,
        JSON.stringify(session.messages)
      );
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }

  // Get all chat sessions
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }

  // Get messages for a specific session
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const messagesJson = await AsyncStorage.getItem(`${CHAT_MESSAGES_PREFIX}${sessionId}`);
      if (messagesJson) {
        const messages = JSON.parse(messagesJson);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  // Delete a chat session
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getChatSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filteredSessions));
      await AsyncStorage.removeItem(`${CHAT_MESSAGES_PREFIX}${sessionId}`);
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  }

  // Get sessions for a specific agent
  async getSessionsForAgent(agentId: string): Promise<ChatSession[]> {
    try {
      const sessions = await this.getChatSessions();
      return sessions.filter(s => s.agentId === agentId);
    } catch (error) {
      console.error('Error getting sessions for agent:', error);
      return [];
    }
  }

  // Clear all chat data
  async clearAllChatData(): Promise<void> {
    try {
      const sessions = await this.getChatSessions();
      
      // Remove all message files
      const removePromises = sessions.map(session =>
        AsyncStorage.removeItem(`${CHAT_MESSAGES_PREFIX}${session.id}`)
      );
      
      await Promise.all(removePromises);
      await AsyncStorage.removeItem(CHAT_SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing chat data:', error);
    }
  }

  // Create a new chat session
  createNewSession(agentId: string): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: sessionId,
      agentId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Add message to session
  async addMessageToSession(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      const messages = await this.getChatMessages(sessionId);
      messages.push(message);
      
      await AsyncStorage.setItem(
        `${CHAT_MESSAGES_PREFIX}${sessionId}`,
        JSON.stringify(messages)
      );

      // Update session timestamp
      const sessions = await this.getChatSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex >= 0) {
        sessions[sessionIndex].updatedAt = new Date();
        sessions[sessionIndex].messages = messages;
        await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error adding message to session:', error);
    }
  }

  // Get recent sessions (last 10)
  async getRecentSessions(): Promise<ChatSession[]> {
    try {
      const sessions = await this.getChatSessions();
      return sessions
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }
}

// Singleton instance
export const chatStorageService = new ChatStorageService();
