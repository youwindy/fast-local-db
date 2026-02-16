// 查询条件类型
export type Where<T> = {
  [K in keyof T]?: T[K];
};

// 查询选项（预留扩展）
export interface FindOptions<T> {
  where?: Where<T>;
  limit?: number;
  offset?: number;
}

// 索引数据结构
export interface IndexData {
  [field: string]: {
    [value: string]: number[];
  };
}
