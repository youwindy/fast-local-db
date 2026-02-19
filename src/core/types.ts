// 查询条件类型
export type Where<T> = {
  [K in keyof T]?: T[K] | WhereOperators<T[K]>;
};

// 查询操作符
export interface WhereOperators<T> {
  $eq?: T;           // 等于
  $ne?: T;           // 不等于
  $gt?: T;           // 大于
  $gte?: T;          // 大于等于
  $lt?: T;           // 小于
  $lte?: T;          // 小于等于
  $in?: T[];         // 在数组中
  $nin?: T[];        // 不在数组中
  $like?: string;    // 模糊匹配（仅字符串）
}

// 查询选项
export interface FindOptions<T> {
  where?: Where<T>;
  limit?: number;
  offset?: number;
  orderBy?: keyof T;
  order?: 'asc' | 'desc';
}

// 索引数据结构
export interface IndexData {
  [field: string]: {
    [value: string]: number[];
  };
}

// 批量操作结果
export interface BulkResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}
