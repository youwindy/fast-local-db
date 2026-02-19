import { Table } from "./Table";
import { Where, FindOptions, BulkResult } from "./types";

/**
 * Model 类
 * 提供面向用户的数据操作接口
 */
export class Model<T extends Record<string, any>> {
  private table: Table<T>;

  constructor(table: Table<T>) {
    this.table = table;
  }

  /**
   * 启用缓存
   */
  enableCache(): this {
    this.table.enableCache();
    return this;
  }

  /**
   * 禁用缓存
   */
  disableCache(): this {
    this.table.disableCache();
    return this;
  }

  /**
   * 清空缓存
   */
  clearCache(): this {
    this.table.clearCache();
    return this;
  }

  /**
   * 创建记录
   */
  create(data: T): T & { id: number } {
    return this.table.create(data);
  }

  /**
   * 批量创建记录
   */
  bulkCreate(dataArray: T[]): BulkResult {
    return this.table.bulkCreate(dataArray);
  }

  /**
   * 根据 ID 查找记录
   */
  findById(id: number): (T & { id: number }) | null {
    return this.table.read(id);
  }

  /**
   * 查询所有记录
   */
  findAll(options?: FindOptions<T>): (T & { id: number })[] {
    return this.table.findAll(options);
  }

  /**
   * 查询单条记录
   */
  findOne(options: FindOptions<T>): (T & { id: number }) | null {
    return this.table.findOne(options);
  }

  /**
   * 更新记录
   */
  update(id: number, data: Partial<T>): (T & { id: number }) | null {
    return this.table.update(id, data);
  }

  /**
   * 批量更新记录
   */
  bulkUpdate(updates: Array<{ id: number; data: Partial<T> }>): BulkResult {
    return this.table.bulkUpdate(updates);
  }

  /**
   * 删除记录
   */
  delete(id: number): boolean {
    return this.table.delete(id);
  }

  /**
   * 批量删除记录
   */
  bulkDelete(ids: number[]): BulkResult {
    return this.table.bulkDelete(ids);
  }

  /**
   * 统计记录数
   */
  count(where?: Where<T>): number {
    return this.table.count(where);
  }
}
