import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { IndexData } from "./types";

/**
 * 索引管理类
 * 用于加速字段查询
 */
export class Index {
  private file: string;
  private data: IndexData = {};

  constructor(base: string, table: string) {
    this.file = join(base, "_index", table + ".json");
    this.load();
  }

  /**
   * 从文件加载索引数据
   */
  private load(): void {
    if (existsSync(this.file)) {
      this.data = JSON.parse(readFileSync(this.file, "utf8"));
    }
  }

  /**
   * 保存索引到文件
   */
  save(): void {
    writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  /**
   * 添加索引项
   */
  add(field: string, value: any, id: number): void {
    const key = String(value);
    
    if (!this.data[field]) {
      this.data[field] = {};
    }
    
    if (!this.data[field][key]) {
      this.data[field][key] = [];
    }
    
    if (!this.data[field][key].includes(id)) {
      this.data[field][key].push(id);
    }
  }

  /**
   * 查找索引
   */
  find(field: string, value: any): number[] {
    const key = String(value);
    return this.data?.[field]?.[key] || [];
  }

  /**
   * 删除索引项
   */
  remove(field: string, value: any, id: number): void {
    const key = String(value);
    
    if (this.data?.[field]?.[key]) {
      this.data[field][key] = this.data[field][key].filter(i => i !== id);
      
      if (this.data[field][key].length === 0) {
        delete this.data[field][key];
      }
    }
  }
}
