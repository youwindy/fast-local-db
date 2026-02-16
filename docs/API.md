# API 文档

## Database

### 构造函数

```typescript
new Database(basePath: string)
```

创建数据库实例。

**参数：**
- `basePath`: 数据库文件存储的根目录路径

**示例：**
```typescript
const db = new Database('./data');
```

### define<T>()

```typescript
define<T extends Record<string, any>>(tableName: string): Model<T>
```

定义一个表并返回 Model 实例。

**参数：**
- `tableName`: 表名
- `T`: 数据类型接口（泛型）

**返回：**
- `Model<T>`: 表的 Model 实例

**示例：**
```typescript
interface User {
  id?: number;
  name: string;
  age: number;
}

const User = db.define<User>('users');
```

---

## Model<T>

### create()

```typescript
create(data: T): T & { id: number }
```

创建一条新记录。

**参数：**
- `data`: 要创建的数据对象

**返回：**
- 创建的记录（包含自动生成的 id）

**示例：**
```typescript
const user = User.create({
  name: '张三',
  age: 20
});
// { id: 1, name: '张三', age: 20 }
```

### findAll()

```typescript
findAll(options?: { where?: Where<T> }): (T & { id: number })[]
```

查询多条记录。

**参数：**
- `options.where`: 查询条件（可选）

**返回：**
- 匹配的记录数组

**示例：**
```typescript
// 查询所有
const allUsers = User.findAll();

// 条件查询
const users = User.findAll({
  where: { age: 20 }
});

// 多条件查询
const users = User.findAll({
  where: { age: 20, name: '张三' }
});
```

### findOne()

```typescript
findOne(where: Where<T>): (T & { id: number }) | null
```

查询单条记录。

**参数：**
- `where`: 查询条件

**返回：**
- 第一条匹配的记录，如果没有找到返回 `null`

**示例：**
```typescript
const user = User.findOne({ name: '张三' });
if (user) {
  console.log(user);
}
```

### findById()

```typescript
findById(id: number): (T & { id: number }) | null
```

根据 ID 查询记录。

**参数：**
- `id`: 记录的 ID

**返回：**
- 匹配的记录，如果没有找到返回 `null`

**示例：**
```typescript
const user = User.findById(1);
if (user) {
  console.log(user);
}
```

### update()

```typescript
update(id: number, data: Partial<T>): (T & { id: number }) | null
```

更新记录。

**参数：**
- `id`: 要更新的记录 ID
- `data`: 要更新的字段（部分更新）

**返回：**
- 更新后的记录，如果记录不存在返回 `null`

**示例：**
```typescript
const updated = User.update(1, {
  age: 21
});
// { id: 1, name: '张三', age: 21 }
```

### delete()

```typescript
delete(id: number): boolean
```

删除记录。

**参数：**
- `id`: 要删除的记录 ID

**返回：**
- `true` 删除成功，`false` 记录不存在

**示例：**
```typescript
const success = User.delete(1);
if (success) {
  console.log('删除成功');
}
```

### count()

```typescript
count(where?: Where<T>): number
```

统计记录数。

**参数：**
- `where`: 查询条件（可选）

**返回：**
- 匹配的记录数量

**示例：**
```typescript
// 统计所有记录
const total = User.count();

// 条件统计
const count = User.count({ age: 20 });
```

---

## 类型定义

### Where<T>

```typescript
type Where<T> = {
  [K in keyof T]?: T[K];
};
```

查询条件类型，支持对任意字段进行精确匹配查询。

**示例：**
```typescript
// 单条件
{ name: '张三' }

// 多条件（AND 关系）
{ name: '张三', age: 20 }
```

---

## 索引机制

fast-local-db 会自动为所有字段建立索引，以加速查询性能。

### 索引存储

索引文件存储在 `{basePath}/_index/{tableName}.json`

### 索引结构

```json
{
  "name": {
    "张三": [1, 3],
    "李四": [2]
  },
  "age": {
    "20": [1],
    "30": [2],
    "25": [3]
  }
}
```

### 索引更新

- 创建记录时自动添加索引
- 更新记录时自动更新索引
- 删除记录时自动删除索引

---

## 最佳实践

### 1. 定义清晰的接口

```typescript
interface User {
  id?: number;  // id 是可选的，会自动生成
  name: string;
  age: number;
  email?: string;
  createdAt?: Date;
}
```

### 2. 错误处理

```typescript
const user = User.findById(999);
if (!user) {
  console.log('用户不存在');
  return;
}

// 使用 user
console.log(user.name);
```

### 3. 批量操作

```typescript
const users = [
  { name: '张三', age: 20 },
  { name: '李四', age: 30 },
  { name: '王五', age: 25 }
];

users.forEach(data => User.create(data));
```

### 4. 条件查询优化

使用索引字段进行查询可以获得更好的性能：

```typescript
// 好：使用索引字段
const users = User.findAll({ where: { name: '张三' } });

// 避免：查询所有后过滤
const allUsers = User.findAll();
const filtered = allUsers.filter(u => u.name === '张三');
```
