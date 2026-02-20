const { Database } = require('../dist/index');
const fs = require('fs');
const path = require('path');

// 清理测试数据
const testDataPath = './test-data';
if (fs.existsSync(testDataPath)) {
  fs.rmSync(testDataPath, { recursive: true, force: true });
}

console.log('=== 开始测试 fast-local-db ===\n');

// 创建数据库
const db = new Database(testDataPath);
const User = db.define('users');

// 测试 1: 创建记录
console.log('测试 1: 创建记录');
const user1 = User.create({ name: '张三', age: 20, email: 'zhangsan@example.com' });
console.log('✓ 创建用户 1:', user1);

const user2 = User.create({ name: '李四', age: 30, email: 'lisi@example.com' });
console.log('✓ 创建用户 2:', user2);

const user3 = User.create({ name: '王五', age: 25 });
console.log('✓ 创建用户 3:', user3);

// 测试 2: 查询所有记录
console.log('\n测试 2: 查询所有记录');
const allUsers = User.findAll();
console.log('✓ 所有用户数量:', allUsers.length);
console.assert(allUsers.length === 3, '应该有 3 条记录');

// 测试 3: 条件查询
console.log('\n测试 3: 条件查询');
const zhangsan = User.findAll({ where: { name: '张三' } });
console.log('✓ 查询张三:', zhangsan);
console.assert(zhangsan.length === 1 && zhangsan[0].name === '张三', '应该找到张三');

// 测试 4: 查询单条记录
console.log('\n测试 4: 查询单条记录');
const oneUser = User.findOne({ where: { name: '李四' } });
console.log('✓ 查询李四:', oneUser);
console.assert(oneUser && oneUser.name === '李四', '应该找到李四');

// 测试 5: 根据 ID 查询
console.log('\n测试 5: 根据 ID 查询');
const userById = User.findById(1);
console.log('✓ ID=1 的用户:', userById);
console.assert(userById && userById.id === 1, '应该找到 ID=1 的用户');

// 测试 6: 更新记录
console.log('\n测试 6: 更新记录');
const updated = User.update(1, { age: 21, email: 'zhangsan_new@example.com' });
console.log('✓ 更新后:', updated);
console.assert(updated && updated.age === 21, '年龄应该更新为 21');

// 测试 7: 统计记录数
console.log('\n测试 7: 统计记录数');
const count = User.count();
console.log('✓ 总用户数:', count);
console.assert(count === 3, '应该有 3 条记录');

const countByAge = User.count({ age: 30 });
console.log('✓ 年龄为 30 的用户数:', countByAge);
console.assert(countByAge === 1, '应该有 1 条记录');

// 测试 8: 删除记录
console.log('\n测试 8: 删除记录');
const deleted = User.delete(3);
console.log('✓ 删除 ID=3:', deleted);
console.assert(deleted === true, '删除应该成功');

const afterDelete = User.findAll();
console.log('✓ 删除后剩余用户数:', afterDelete.length);
console.assert(afterDelete.length === 2, '应该剩余 2 条记录');

// 测试 9: 查询不存在的记录
console.log('\n测试 9: 查询不存在的记录');
const notFound = User.findById(999);
console.log('✓ 查询不存在的 ID:', notFound);
console.assert(notFound === null, '应该返回 null');

// 测试 10: 删除不存在的记录
console.log('\n测试 10: 删除不存在的记录');
const deleteFailed = User.delete(999);
console.log('✓ 删除不存在的记录:', deleteFailed);
console.assert(deleteFailed === false, '应该返回 false');

// 测试 11: 多条件查询
console.log('\n测试 11: 多条件查询');
User.create({ name: '张三', age: 30 }); // 创建另一个张三
const multiCondition = User.findAll({ where: { name: '张三', age: 21 } });
console.log('✓ 多条件查询结果:', multiCondition);
console.assert(multiCondition.length === 1, '应该只找到一条记录');

console.log('\n=== 所有测试通过 ✓ ===');

// 清理测试数据
fs.rmSync(testDataPath, { recursive: true, force: true });
console.log('\n测试数据已清理');
