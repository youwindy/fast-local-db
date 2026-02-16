import { Database } from "../src/core/Database";

interface User {
  id?: number;
  name: string;
  age: number;
  email?: string;
}

// 创建数据库实例
const db = new Database("./data");

// 定义 User 表
const User = db.define<User>("users");

console.log("=== 创建记录 ===");
const user1 = User.create({
  name: "张三",
  age: 20,
  email: "zhangsan@example.com",
});
console.log("创建用户:", user1);

const user2 = User.create({
  name: "李四",
  age: 30,
  email: "lisi@example.com",
});
console.log("创建用户:", user2);

const user3 = User.create({
  name: "王五",
  age: 25,
});
console.log("创建用户:", user3);

console.log("\n=== 查询所有记录 ===");
const allUsers = User.findAll();
console.log("所有用户:", allUsers);

console.log("\n=== 条件查询 ===");
const zhangsan = User.findAll({ where: { name: "张三" } });
console.log("查询张三:", zhangsan);

console.log("\n=== 查询单条记录 ===");
const oneUser = User.findOne({ name: "李四" });
console.log("查询李四:", oneUser);

console.log("\n=== 根据 ID 查询 ===");
const userById = User.findById(1);
console.log("ID=1 的用户:", userById);

console.log("\n=== 更新记录 ===");
const updated = User.update(1, { age: 21, email: "zhangsan_new@example.com" });
console.log("更新后:", updated);

console.log("\n=== 统计记录数 ===");
const count = User.count();
console.log("总用户数:", count);

console.log("\n=== 删除记录 ===");
const deleted = User.delete(3);
console.log("删除 ID=3:", deleted);

console.log("\n=== 删除后的所有记录 ===");
console.log("剩余用户:", User.findAll());
