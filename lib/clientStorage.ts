// Client-side storage for fast message handling
interface Message {
  id: number;
  userId: number;
  type: string;
  prompt: string;
  content: string;
  fileName?: string;
  category: string;
  selectedModel: string;
  status: string;
  confidence: number;
  reasoning?: string;
  response?: string;
  processingTime?: number;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

class ClientStorage {
  private storageKey = 'luminadoc_messages';
  private messageId = 1;

  constructor() {
    // Initialize message ID from existing data
    const messages = this.getMessages();
    if (messages.length > 0) {
      this.messageId = Math.max(...messages.map(m => m.id)) + 1;
    }
  }

  getMessages(): Message[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Message {
    const newMessage: Message = {
      ...message,
      id: this.messageId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const messages = this.getMessages();
    messages.push(newMessage);
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
    
    return newMessage;
  }

  updateMessage(id: number, updates: Partial<Message>): Message | null {
    const messages = this.getMessages();
    const index = messages.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    messages[index] = {
      ...messages[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
    return messages[index];
  }

  deleteMessage(id: number): boolean {
    const messages = this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    
    if (filtered.length === messages.length) return false;
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    this.messageId = 1;
  }
}

export const clientStorage = new ClientStorage();