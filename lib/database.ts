// Database connection and storage management for Luminadoc
import { IStorage, storage } from './storage';

// Export the main database storage instance
export const dbStorage: IStorage = storage;

// Export database utilities
export { type IStorage } from './storage';