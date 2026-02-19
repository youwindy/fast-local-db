# Changelog

## [1.1.0] - 2024-02-16

### 新增功能
- ✨ 批量操作支持
  - `bulkCreate()` - 批量创建记录
  - `bulkUpdate()` - 批量更新记录
  - `bulkDelete()` - 批量删除记录
- ✨ 高级查询操作符
  - `$eq` - 等于
  - `$ne` - 不等于
  - `$gt` - 大于
  - `$gte` - 大于等于
  - `$lt` - 小于
  - `$lte` - 小于等于
  - `$in` - 在数组中
  - `$nin` - 不在数组中
  - `$like` - 模糊匹配
- ✨ 查询增强
  - 排序支持 (`orderBy`, `order`)
  - 分页支持 (`limit`, `offset`)
- ✨ 缓存机制
  - `enableCache()` - 启用内存缓存
  - `disableCache()` - 禁用缓存
  - `clearCache()` - 清空缓存
  - 缓存可提升 100% 查询性能

### 改进
- 🔧 优化查询性能
- 🔧 改进 API 设计，支持链式调用
- 🔧 完善 TypeScript 类型定义

## [1.0.0] - 2024-02-16

### 新增功能
- ✨ 完整的 CRUD 操作支持
- ✨ `findById()` - 根据 ID 查询记录
- ✨ `findOne()` - 查询单条记录
- ✨ `update()` - 更新记录
- ✨ `delete()` - 删除记录
- ✨ `count()` - 统计记录数
- ✨ 自动索引管理，支持增删改查时自动更新索引
- ✨ 完整的 TypeScript 类型支持

### 改进
- 🔧 优化索引查询性能
- 🔧 改进错误处理，返回 null 而不是抛出异常
- 🔧 添加详细的代码注释和文档
- 🔧 规范化代码风格

### 核心模块
- `Database` - 数据库入口
- `Model` - 数据操作接口
- `Table` - 表管理和 CRUD 实现
- `Index` - 索引管理
- `types` - TypeScript 类型定义
