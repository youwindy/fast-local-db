import { Table } from "./Table";
import { Where } from "./types";

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
   * 创建记录
   */
  create(data: T): T & { id: number } {
    return this.table.create(data);
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
  findAll(options?: { where?: Where<T> }): (T & { id: number })[] {
    return this.table.findAll(options?.where);
  }

  /**
   * 查询单条记录
   */
  findOne(where: Where<T>): (T & { id: number }) | null {
    return this.table.findOne(where);
  }

  /**
   * 更新记录
   */
  update(id: number, data: Partial<T>): (T & { id: number }) | null {
    return this.table.update(id, data);
  }

  /**
   * 删除记录
   */
  delete(id: number): boolean {
    return this.table.delete(id);
  }

  /**
   * 统计记录数
   */
  count(where?: Where<T>): number {
    return this.findAll({ where }).length;
  }
}
