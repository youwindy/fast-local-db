import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { join } from "path";
import { Database } from "./Database";
import { Index } from "./Index";
import { Where, FindOptions, BulkResult, WhereOperators } from "./types";

/**
 * 表管理类
 * 负责数据的 CRUD 操作
 */
export class Table<T extends Record<string, any>> {
  private db: Database;
  private name: string;
  private index: Index;
  private cache: Map<number, T & { id: number }> = new Map();
  private cacheEnabled: boolean = false;

  constructor(db: Database, name: string) {
    this.db = db;
    this.name = name;
    this.index = new Index(db.base, name);
    mkdirSync(this.path(), { recursive: true });
  }

  /**
   * 启用缓存
   */
  enableCache(): void {
    this.cacheEnabled = true;
  }

  /**
   * 禁用缓存
   */
  disableCache(): void {
    this.cacheEnabled = false;
    this.cache.clear();
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取表的存储路径
   */
  private path(): string {
    return join(this.db.base, this.name);
  }

  /**
   * 获取下一个可用 ID
   */
  private nextId(): number {
    const files = readdirSync(this.path());
    if (files.length === 0) return 1;
    
    const ids = files
      .map(f => parseInt(f.replace('.json', '')))
      .filter(id => !isNaN(id));
    
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  /**
   * 创建记录
   */
  create(data: T): T & { id: number } {
    const id = (data as any).id || this.nextId();
    const row = { ...data, id } as T & { id: number };

    writeFileSync(
      join(this.path(), `${id}.json`),
      JSON.stringify(row, null, 2)
    );

    // 为所有字段建立索引
    for (const key in row) {
      this.index.add(key, row[key], id);
    }
    
    this.index.save();
    
    // 更新缓存
    if (this.cacheEnabled) {
      this.cache.set(id, row);
    }
    
    return row;
  }

  /**
   * 批量创建记录
   */
  bulkCreate(dataArray: T[]): BulkResult {
    const result: BulkResult = { success: 0, failed: 0, errors: [] };
    
    dataArray.forEach((data, index) => {
      try {
        this.create(data);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    return result;
  }

  /**
   * 根据 ID 读取记录
   */
  read(id: number): (T & { id: number }) | null {
    // 检查缓存
    if (this.cacheEnabled && this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const filePath = join(this.path(), `${id}.json`);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    const data = JSON.parse(readFileSync(filePath, "utf8"));
    
    // 写入缓存
    if (this.cacheEnabled) {
      this.cache.set(id, data);
    }
    
    return data;
  }

  /**
   * 更新记录
   */
  update(id: number, data: Partial<T>): (T & { id: number }) | null {
    const existing = this.read(id);
    
    if (!existing) {
      return null;
    }

    // 删除旧索引
    for (const key in existing) {
      this.index.remove(key, existing[key], id);
    }

    const updated = { ...existing, ...data, id };

    writeFileSync(
      join(this.path(), `${id}.json`),
      JSON.stringify(updated, null, 2)
    );

    // 添加新索引
    for (const key in updated) {
      this.index.add(key, updated[key], id);
    }
    
    this.index.save();
    
    // 更新缓存
    if (this.cacheEnabled) {
      this.cache.set(id, updated);
    }
    
    return updated;
  }

  /**
   * 批量更新记录
   */
  bulkUpdate(updates: Array<{ id: number; data: Partial<T> }>): BulkResult {
    const result: BulkResult = { success: 0, failed: 0, errors: [] };
    
    updates.forEach((item, index) => {
      try {
        const updated = this.update(item.id, item.data);
        if (updated) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push({ index, error: 'Record not found' });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          index,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    return result;
  }

  /**
   * 删除记录
   */
  delete(id: number): boolean {
    const filePath = join(this.path(), `${id}.json`);
    
    if (!existsSync(filePath)) {
      return false;
    }

    const existing = this.read(id);
    
    if (existing) {
      // 删除索引
      for (const key in existing) {
        this.index.remove(key, existing[key], id);
      }
      this.index.save();
    }

    unlinkSync(filePath);
    
    // 清除缓存
    if (this.cacheEnabled) {
      this.cache.delete(id);
    }
    
    return true;
  }

  /**
   * 批量删除记录
   */
  bulkDelete(ids: number[]): BulkResult {
    const result: BulkResult = { success: 0, failed: 0, errors: [] };
    
    ids.forEach((id, index) => {
      try {
        const deleted = this.delete(id);
        if (deleted) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push({ index, error: 'Record not found' });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          index,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    return result;
  }

  /**
   * 查询所有记录
   */
  findAll(options?: FindOptions<T>): (T & { id: number })[] {
    const where = options?.where;
    let results: (T & { id: number })[];

    // 无条件查询，返回所有记录
    if (!where || Object.keys(where).length === 0) {
      results = readdirSync(this.path())
        .filter(f => f.endsWith('.json'))
        .map(f => this.read(parseInt(f.replace('.json', ''))))
        .filter((row): row is T & { id: number } => row !== null);
    } else {
      // 使用索引查询第一个条件
      const entries = Object.entries(where);
      const [firstKey, firstValue] = entries[0];
      
      // 简单值查询
      if (typeof firstValue !== 'object' || firstValue === null) {
        let ids = this.index.find(firstKey as string, firstValue);
        results = ids
          .map(id => this.read(id))
          .filter((row): row is T & { id: number } => row !== null);
      } else {
        // 获取所有记录进行过滤
        results = readdirSync(this.path())
          .filter(f => f.endsWith('.json'))
          .map(f => this.read(parseInt(f.replace('.json', ''))))
          .filter((row): row is T & { id: number } => row !== null);
      }

      // 应用所有条件过滤
      results = results.filter(row => this.matchWhere(row, where));
    }

    // 排序
    if (options?.orderBy) {
      const key = options.orderBy;
      const order = options.order || 'asc';
      results.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 分页
    if (options?.offset !== undefined || options?.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit;
      results = limit ? results.slice(offset, offset + limit) : results.slice(offset);
    }

    return results;
  }

  /**
   * 匹配查询条件
   */
  private matchWhere(row: T & { id: number }, where: Where<T>): boolean {
    return Object.entries(where).every(([key, condition]) => {
      const value = row[key as keyof T];

      // 简单值匹配
      if (typeof condition !== 'object' || condition === null) {
        return value === condition;
      }

      // 操作符匹配
      const ops = condition as WhereOperators<any>;
      
      if (ops.$eq !== undefined && value !== ops.$eq) return false;
      if (ops.$ne !== undefined && value === ops.$ne) return false;
      if (ops.$gt !== undefined && !(value > ops.$gt)) return false;
      if (ops.$gte !== undefined && !(value >= ops.$gte)) return false;
      if (ops.$lt !== undefined && !(value < ops.$lt)) return false;
      if (ops.$lte !== undefined && !(value <= ops.$lte)) return false;
      if (ops.$in !== undefined && !ops.$in.includes(value)) return false;
      if (ops.$nin !== undefined && ops.$nin.includes(value)) return false;
      if (ops.$like !== undefined && typeof value === 'string') {
        const pattern = ops.$like.replace(/%/g, '.*');
        if (!new RegExp(pattern, 'i').test(value)) return false;
      }

      return true;
    });
  }

  /**
   * 查询单条记录
   */
  findOne(options: FindOptions<T>): (T & { id: number }) | null {
    const results = this.findAll({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 统计记录数
   */
  count(where?: Where<T>): number {
    return this.findAll({ where }).length;
  }
}
