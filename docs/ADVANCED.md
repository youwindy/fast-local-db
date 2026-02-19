# 高级功能文档

## 批量操作

### bulkCreate - 批量创建

批量创建多条记录，提高插入性能。

```typescript
const users = [
  { name: '张三', age: 20 },
  { name: '李四', age: 30 },
  { name: '王五', age: 25 }
];

const result = User.bulkCreate(users);
console.log(result);
// { success: 3, failed: 0, errors: [] }
```

### bulkUpdate - 批量更新

批量更新多条记录。

```typescript
const updates = [
  { id: 1, data: { age: 21 } },
  { id: 2, data: { age: 31 } }
];

const result = User.bulkUpdate(updates);
console.log(result);
// { success: 2, failed: 0, errors: [] }
```

### bulkDelete - 批量删除

批量删除多条记录。

```typescript
const result = User.bulkDelete([1, 2, 3]);
console.log(result);
// { success: 3, failed: 0, errors: [] }
```

## 高级查询

### 比较操作符

```typescript
// 等于
User.findAll({ where: { age: { $eq: 20 } } });

// 不等于
User.findAll({ where: { age: { $ne: 20 } } });

// 大于
User.findAll({ where: { age: { $gt: 20 } } });

// 大于等于
User.findAll({ where: { age: { $gte: 20 } } });

// 小于
User.findAll({ where: { age: { $lt: 30 } } });

// 小于等于
User.findAll({ where: { age: { $lte: 30 } } });
```

### 范围查询

```typescript
// 年龄在 20-30 之间
User.findAll({
  where: {
    age: { $gte: 20, $lte: 30 }
  }
});
```

### IN / NOT IN 查询

```typescript
// 城市在北京或上海
User.findAll({
  where: {
    city: { $in: ['北京', '上海'] }
  }
});

// 城市不在北京或上海
User.findAll({
  where: {
    city: { $nin: ['北京', '上海'] }
  }
});
```

### 模糊查询

```typescript
// 名字包含"张"
User.findAll({
  where: {
    name: { $like: '%张%' }
  }
});

// 名字以"张"开头
User.findAll({
  where: {
    name: { $like: '张%' }
  }
});

// 名字以"三"结尾
User.findAll({
  where: {
    name: { $like: '%三' }
  }
});
```

### 多条件组合

```typescript
// 北京且年龄大于 20
User.findAll({
  where: {
    city: '北京',
    age: { $gt: 20 }
  }
});

// 复杂组合
User.findAll({
  where: {
    age: { $gte: 20, $lt: 30 },
    city: { $in: ['北京', '上海'] }
  }
});
```

## 排序

```typescript
// 按年龄升序
User.findAll({
  orderBy: 'age',
  order: 'asc'
});

// 按年龄降序
User.findAll({
  orderBy: 'age',
  order: 'desc'
});

// 结合查询条件
User.findAll({
  where: { city: '北京' },
  orderBy: 'age',
  order: 'desc'
});
```

## 分页

```typescript
// 每页 10 条，获取第 1 页
User.findAll({
  limit: 10,
  offset: 0
});

// 每页 10 条，获取第 2 页
User.findAll({
  limit: 10,
  offset: 10
});

// 结合排序和查询
User.findAll({
  where: { city: '北京' },
  orderBy: 'age',
  order: 'asc',
  limit: 10,
  offset: 0
});
```

## 缓存机制

启用缓存可以显著提升查询性能（约 100%）。

### 启用缓存

```typescript
// 启用缓存（支持链式调用）
User.enableCache();

// 或者
const User = db.define('users').enableCache();
```

### 禁用缓存

```typescript
User.disableCache();
```

### 清空缓存

```typescript
// 清空缓存但保持启用状态
User.clearCache();
```

### 缓存使用场景

适合使用缓存：
- 读多写少的场景
- 频繁查询相同记录
- 数据量不大（避免内存占用过多）

不适合使用缓存：
- 写多读少的场景
- 数据量特别大
- 需要实时数据的场景

### 性能对比

```typescript
User.enableCache();

// 第一次查询会从文件读取
const user1 = User.findById(1); // ~10ms

// 后续查询从缓存读取
const user2 = User.findById(1); // ~0.1ms

// 性能提升约 100 倍
```

## 完整示例

```typescript
import { Database } from 'fast-local-db';

interface User {
  id?: number;
  name: string;
  age: number;
  city: string;
  email?: string;
}

const db = new Database('./data');
const User = db.define<User>('users').enableCache();

// 批量创建
const users = [
  { name: '张三', age: 20, city: '北京', email: 'zhangsan@example.com' },
  { name: '李四', age: 30, city: '上海', email: 'lisi@example.com' },
  { name: '王五', age: 25, city: '北京', email: 'wangwu@example.com' },
  { name: '赵六', age: 35, city: '广州', email: 'zhaoliu@example.com' }
];

User.bulkCreate(users);

// 复杂查询：北京的用户，年龄 20-30，按年龄降序，每页 10 条
const results = User.findAll({
  where: {
    city: '北京',
    age: { $gte: 20, $lte: 30 }
  },
  orderBy: 'age',
  order: 'desc',
  limit: 10,
  offset: 0
});

console.log(results);

// 批量更新
User.bulkUpdate([
  { id: 1, data: { age: 21 } },
  { id: 2, data: { age: 31 } }
]);

// 统计
const count = User.count({ where: { city: '北京' } });
console.log(`北京用户数: ${count}`);
```

## 性能优化建议

1. 使用索引字段进行查询（自动为所有字段建立索引）
2. 启用缓存提升读取性能
3. 使用批量操作减少 I/O 次数
4. 合理使用分页避免一次加载过多数据
5. 定期清理不需要的数据
