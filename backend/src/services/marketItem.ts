import MarketItemModel from '../models/MarketItem';
import { MarketItemCreate, MarketItemUpdate } from '../types';

class MarketItemService {
  /**
   * Create a new market item
   */
  static async createMarketItem(data: MarketItemCreate): Promise<number> {
    // Check if name already exists
    const nameExists = await MarketItemModel.nameExists(data.name);
    if (nameExists) {
      throw new Error('Market item with this name already exists');
    }

    return await MarketItemModel.create(data);
  }

  /**
   * Get market item by ID
   */
  static async getMarketItem(id: number) {
    const item = await MarketItemModel.findById(id);
    if (!item) {
      throw new Error('Market item not found');
    }
    return item;
  }

  /**
   * Get all market items with pagination
   */
  static async getAllMarketItems(page: number = 1, limit: number = 10, category?: string, isActive?: boolean) {
    return await MarketItemModel.getAll(page, limit, category, isActive);
  }

  /**
   * Search market items by name
   */
  static async searchMarketItems(name: string, page: number = 1, limit: number = 10) {
    return await MarketItemModel.searchByName(name, page, limit);
  }

  /**
   * Get market items by category
   */
  static async getMarketItemsByCategory(category: string, page: number = 1, limit: number = 10) {
    return await MarketItemModel.getByCategory(category, page, limit);
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    return await MarketItemModel.getCategories();
  }

  /**
   * Update market item
   */
  static async updateMarketItem(id: number, data: MarketItemUpdate): Promise<boolean> {
    // Check if name already exists (if name is being updated)
    if (data.name) {
      const nameExists = await MarketItemModel.nameExists(data.name, id);
      if (nameExists) {
        throw new Error('Market item with this name already exists');
      }
    }

    return await MarketItemModel.update(id, data);
  }

  /**
   * Delete market item
   */
  static async deleteMarketItem(id: number): Promise<boolean> {
    // Check if item exists
    const item = await MarketItemModel.findById(id);
    if (!item) {
      throw new Error('Market item not found');
    }

    // Check if item has associated prices (you might want to prevent deletion if prices exist)
    // This would require a check in the MarketPriceModel

    return await MarketItemModel.delete(id);
  }

  /**
   * Toggle market item active status
   */
  static async toggleMarketItemStatus(id: number): Promise<boolean> {
    const item = await MarketItemModel.findById(id);
    if (!item) {
      throw new Error('Market item not found');
    }

    return await MarketItemModel.update(id, { is_active: !item.is_active });
  }

  /**
   * Get market item statistics
   */
  static async getMarketItemStats() {
    const allItems = await MarketItemModel.getAll(1, 1000);
    const activeItems = await MarketItemModel.getAll(1, 1000, undefined, true);
    const categories = await MarketItemModel.getCategories();

    return {
      total_items: allItems.pagination.total,
      active_items: activeItems.pagination.total,
      inactive_items: allItems.pagination.total - activeItems.pagination.total,
      total_categories: categories.length,
      categories: categories
    };
  }
}

export default MarketItemService;
