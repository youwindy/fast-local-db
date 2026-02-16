# Changelog

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
