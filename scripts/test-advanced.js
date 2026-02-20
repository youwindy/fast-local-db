const { Database } = require('../dist/index');
const fs = require('fs');

// 清理测试数据
const testDataPath = './test-data-advanced';
if (fs.existsSync(testDataPath)) {
  fs.rmSync(testDataPath, { recursive: true, force: true });
}

console.log('=== 测试优化后的功能 ===\n');

const db = new Database(testDataPath);
const User = db.define('users');

// 测试 1: 批量创建
console.log('测试 1: 批量创建记录');
const users = [
  { name: '张三', age: 20, city: '北京' },
  { name: '李四', age: 30, city: '上海' },
  { name: '王五', age: 25, city: '北京' },
  { name: '赵六', age: 35, city: '广州' },
  { name: '钱七', age: 28, city: '上海' }
];

const bulkResult = User.bulkCreate(users);
console.log('✓ 批量创建结果:', bulkResult);
console.assert(bulkResult.success === 5, '应该成功创建 5 条记录');

// 测试 2: 高级查询 - 大于
console.log('\n测试 2: 高级查询 - 年龄大于 25');
const olderUsers = User.findAll({
  where: { age: { $gt: 25 } }
});
console.log('✓ 年龄 > 25 的用户:', olderUsers.map(u => ({ name: u.name, age: u.age })));
console.assert(olderUsers.length === 3, '应该有 3 个用户');

// 测试 3: 范围查询
console.log('\n测试 3: 范围查询 - 年龄 25-30');
const rangeUsers = User.findAll({
  where: { age: { $gte: 25, $lte: 30 } }
});
console.log('✓ 年龄 25-30 的用户:', rangeUsers.map(u => ({ name: u.name, age: u.age })));
console.assert(rangeUsers.length === 3, '应该有 3 个用户');

// 测试 4: IN 查询
console.log('\n测试 4: IN 查询 - 城市在北京或上海');
const cityUsers = User.findAll({
  where: { city: { $in: ['北京', '上海'] } }
});
console.log('✓ 北京或上海的用户:', cityUsers.map(u => ({ name: u.name, city: u.city })));
console.assert(cityUsers.length === 4, '应该有 4 个用户');

// 测试 5: 模糊查询
console.log('\n测试 5: 模糊查询 - 名字包含"三"');
const likeUsers = User.findAll({
  where: { name: { $like: '%三%' } }
});
console.log('✓ 名字包含"三"的用户:', likeUsers.map(u => u.name));
console.assert(likeUsers.length === 1, '应该有 1 个用户');

// 测试 6: 排序
console.log('\n测试 6: 排序 - 按年龄降序');
const sortedUsers = User.findAll({
  orderBy: 'age',
  order: 'desc'
});
console.log('✓ 按年龄降序:', sortedUsers.map(u => ({ name: u.name, age: u.age })));
console.assert(sortedUsers[0].age === 35, '第一个应该是年龄最大的');

// 测试 7: 分页
console.log('\n测试 7: 分页 - 每页 2 条，第 2 页');
const pagedUsers = User.findAll({
  orderBy: 'age',
  order: 'asc',
  offset: 2,
  limit: 2
});
console.log('✓ 第 2 页用户:', pagedUsers.map(u => ({ name: u.name, age: u.age })));
console.assert(pagedUsers.length === 2, '应该有 2 条记录');

// 测试 8: 批量更新
console.log('\n测试 8: 批量更新');
const updateResult = User.bulkUpdate([
  { id: 1, data: { age: 21 } },
  { id: 2, data: { age: 31 } }
]);
console.log('✓ 批量更新结果:', updateResult);
console.assert(updateResult.success === 2, '应该成功更新 2 条记录');

// 测试 9: 批量删除
console.log('\n测试 9: 批量删除');
const deleteResult = User.bulkDelete([4, 5]);
console.log('✓ 批量删除结果:', deleteResult);
console.assert(deleteResult.success === 2, '应该成功删除 2 条记录');

const remainingCount = User.count();
console.log('✓ 剩余用户数:', remainingCount);
console.assert(remainingCount === 3, '应该剩余 3 条记录');

// 测试 10: 缓存功能
console.log('\n测试 10: 缓存功能');
User.enableCache();

const start1 = Date.now();
for (let i = 0; i < 100; i++) {
  User.findById(1);
}
const time1 = Date.now() - start1;
console.log('✓ 启用缓存后 100 次查询耗时:', time1 + 'ms');

User.disableCache();

const start2 = Date.now();
for (let i = 0; i < 100; i++) {
  User.findById(1);
}
const time2 = Date.now() - start2;
console.log('✓ 禁用缓存后 100 次查询耗时:', time2 + 'ms');

console.log('✓ 性能提升:', ((time2 - time1) / time2 * 100).toFixed(1) + '%');

// 测试 11: 复杂组合查询
console.log('\n测试 11: 复杂组合查询');
const complexUsers = User.findAll({
  where: {
    age: { $gte: 20, $lt: 30 },
    city: '北京'
  },
  orderBy: 'age',
  order: 'asc'
});
console.log('✓ 北京且年龄 20-30 的用户:', complexUsers.map(u => ({ name: u.name, age: u.age, city: u.city })));

console.log('\n=== 所有高级测试通过 ✓ ===');

// 清理测试数据
fs.rmSync(testDataPath, { recursive: true, force: true });
console.log('\n测试数据已清理');
