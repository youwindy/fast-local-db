import { mkdirSync } from "fs";
import { join } from "path";
import { Model } from "./Model";
import { Table } from "./Table";

/**
 * Database 类
 * 数据库的入口，负责初始化和表定义
 */
export class Database {
  public readonly base: string;

  constructor(base: string) {
    this.base = base;
    
    // 创建数据库目录
    mkdirSync(base, { recursive: true });
    
    // 创建索引目录
    mkdirSync(join(base, "_index"), { recursive: true });
  }

  /**
   * 定义一个表并返回 Model 实例
   */
  define<T extends Record<string, any>>(name: string): Model<T> {
    return new Model<T>(new Table<T>(this, name));
  }
}
