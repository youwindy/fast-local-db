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
import { Where } from "./types";

/**
 * 表管理类
 * 负责数据的 CRUD 操作
 */
export class Table<T extends Record<string, any>> {
  private db: Database;
  private name: string;
  private index: Index;

  constructor(db: Database, name: string) {
    this.db = db;
    this.name = name;
    this.index = new Index(db.base, name);
    mkdirSync(this.path(), { recursive: true });
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
    return row;
  }

  /**
   * 根据 ID 读取记录
   */
  read(id: number): (T & { id: number }) | null {
    const filePath = join(this.path(), `${id}.json`);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    return JSON.parse(readFileSync(filePath, "utf8"));
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
    return updated;
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
    return true;
  }

  /**
   * 查询所有记录
   */
  findAll(where?: Where<T>): (T & { id: number })[] {
    // 无条件查询，返回所有记录
    if (!where || Object.keys(where).length === 0) {
      return readdirSync(this.path())
        .filter(f => f.endsWith('.json'))
        .map(f => this.read(parseInt(f.replace('.json', ''))))
        .filter((row): row is T & { id: number } => row !== null);
    }

    // 使用索引查询第一个条件
    const entries = Object.entries(where);
    const [firstKey, firstValue] = entries[0];
    let ids = this.index.find(firstKey as string, firstValue);

    // 如果有多个条件，需要过滤结果
    if (entries.length > 1) {
      const results = ids
        .map(id => this.read(id))
        .filter((row): row is T & { id: number } => row !== null);

      return results.filter(row => {
        return entries.every(([key, value]) => row[key as keyof T] === value);
      });
    }

    return ids
      .map(id => this.read(id))
      .filter((row): row is T & { id: number } => row !== null);
  }

  /**
   * 查询单条记录
   */
  findOne(where: Where<T>): (T & { id: number }) | null {
    const results = this.findAll(where);
    return results.length > 0 ? results[0] : null;
  }
}
