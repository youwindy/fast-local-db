# fast-local-db

一个快速、简单的基于文件的本地数据库，适用于 Node.js 项目。

## 特性

- 🚀 轻量级，零依赖
- 📁 基于 JSON 文件存储
- 🔍 支持索引查询，快速检索
- 💪 完整的 TypeScript 支持
- 🎯 简单易用的 API
- ✨ 支持 CRUD 完整操作

## 安装

```bash
npm install fast-local-db
```

## 快速开始

```typescript
import { Database } from 'fast-local-db';

interface User {
  id?: number;
  name: string;
  age: number;
}

// 创建数据库实例
const db = new Database('./data');

// 定义表
const User = db.define<User>('users');

// 创建记录
const user = User.create({
  name: '张三',
  age: 20
});

// 查询记录
const users = User.findAll({
  where: { name: '张三' }
});

console.log(users);
```

## API 文档

### Database

创建数据库实例：

```typescript
const db = new Database(basePath: string);
```

- `basePath`: 数据库文件存储路径

定义表：

```typescript
const Model = db.define<T>(tableName: string);
```

- `tableName`: 表名
- `T`: 数据类型接口

### Model

#### create(data: T)

创建一条记录：

```typescript
const user = User.create({
  name: '张三',
  age: 20
});
// 返回: { id: 1, name: '张三', age: 20 }
```

#### findAll(options?)

查询所有记录：

```typescript
// 查询所有
const allUsers = User.findAll();

// 条件查询
const users = User.findAll({
  where: { age: 20 }
});
```

#### findOne(where)

查询单条记录：

```typescript
const user = User.findOne({ name: '张三' });
// 返回第一条匹配的记录或 null
```

#### findById(id)

根据 ID 查询：

```typescript
const user = User.findById(1);
// 返回记录或 null
```

#### update(id, data)

更新记录：

```typescript
const updated = User.update(1, {
  age: 21
});
// 返回更新后的记录或 null
```

#### delete(id)

删除记录：

```typescript
const success = User.delete(1);
// 返回 true 或 false
```

#### count(where?)

统计记录数：

```typescript
const total = User.count();
const count = User.count({ age: 20 });
```

## 数据存储结构

```
data/
├── users/           # 用户表数据
│   ├── 1.json
│   ├── 2.json
│   └── 3.json
└── _index/          # 索引文件
    └── users.json
```

每条记录存储为独立的 JSON 文件，索引文件用于加速查询。

## 示例

查看 `examples/` 目录获取更多使用示例。

运行示例：

```bash
npm run build
node examples/basic.js
```

## 注意事项

- 适用于小型项目和原型开发
- 不适合高并发场景
- 数据存储在本地文件系统
- 自动为所有字段建立索引

## License

ISC
