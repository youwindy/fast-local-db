# GitHub Actions 自动发布设置指南

## 前提条件

1. 代码已推送到 GitHub
2. 拥有 npm 账号

## 设置步骤

### 第一步：创建 npm 自动化令牌

1. 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. 点击 "Generate New Token"
3. 选择 "Automation" 类型（可以绕过 2FA）
4. 复制生成的令牌（格式：`npm_xxxxxxxxxxxxxxxxxxxx`）

### 第二步：在 GitHub 添加 Secret

1. 访问你的 GitHub 仓库
2. 进入 `Settings` > `Secrets and variables` > `Actions`
3. 点击 `New repository secret`
4. 添加以下 Secret：
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 npm 令牌

### 第三步：推送 GitHub Actions 配置

```bash
git add .github/
git commit -m "Add GitHub Actions for auto publish"
git push
```

## 使用方法

### 方式 1：创建 GitHub Release（推荐）

1. 在 GitHub 仓库页面，点击右侧的 "Releases"
2. 点击 "Create a new release"
3. 填写信息：
   - Tag version: `v1.1.0`（与 package.json 版本一致）
   - Release title: `v1.1.0`
   - Description: 填写更新内容
4. 点击 "Publish release"

**自动触发发布流程：**
- ✅ 运行测试
- ✅ 构建项目
- ✅ 发布到 npm

### 方式 2：使用命令行创建 Release

```bash
# 安装 GitHub CLI（如果还没安装）
# Windows: winget install GitHub.cli
# Mac: brew install gh

# 登录 GitHub
gh auth login

# 创建 Release（会自动触发发布）
gh release create v1.1.0 --title "v1.1.0" --notes "Release notes here"
```

### 方式 3：使用 Git Tag

```bash
# 创建并推送 tag
git tag v1.1.0
git push origin v1.1.0

# 然后在 GitHub 网页上基于这个 tag 创建 Release
```

## 工作流说明

### publish.yml - 自动发布

**触发条件：** 创建 GitHub Release

**执行步骤：**
1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 运行测试
5. 构建项目
6. 发布到 npm

### test.yml - 自动测试

**触发条件：** 推送到 main/master 分支或创建 PR

**执行步骤：**
1. 在多个 Node.js 版本上测试（16, 18, 20）
2. 运行所有测试
3. 构建项目

## 版本发布流程

### 完整流程示例

```bash
# 1. 更新版本号
npm version patch  # 1.1.0 -> 1.1.1 (bug 修复)
# 或
npm version minor  # 1.1.0 -> 1.2.0 (新功能)
# 或
npm version major  # 1.1.0 -> 2.0.0 (破坏性更新)

# 2. 更新 CHANGELOG.md
# 手动编辑 CHANGELOG.md，添加更新内容

# 3. 提交更改
git add .
git commit -m "Bump version to 1.1.1"
git push

# 4. 创建 Release（自动触发发布）
gh release create v1.1.1 \
  --title "v1.1.1" \
  --notes "Bug fixes and improvements"

# 或者在 GitHub 网页上创建 Release
```

## 监控发布状态

1. 访问 GitHub 仓库的 "Actions" 标签
2. 查看 "Publish to npm" 工作流
3. 查看执行日志

## 验证发布

发布成功后：

1. 访问 https://www.npmjs.com/package/fast-local-db
2. 检查版本号是否更新
3. 测试安装：
   ```bash
   npm install fast-local-db@latest
   ```

## 常见问题

### 1. 发布失败：权限错误

**原因：** NPM_TOKEN 未正确设置或已过期

**解决：**
- 重新生成 npm token
- 更新 GitHub Secret

### 2. 测试失败导致发布中断

**原因：** 代码有问题或测试未通过

**解决：**
- 修复代码问题
- 确保本地测试通过：`npm run test:all`

### 3. 版本号冲突

**原因：** npm 上已存在相同版本

**解决：**
- 更新 package.json 中的版本号
- 重新创建 Release

### 4. 工作流未触发

**原因：** 配置文件路径错误或 GitHub Actions 未启用

**解决：**
- 确保文件在 `.github/workflows/` 目录
- 检查 GitHub 仓库设置中 Actions 是否启用

## 安全建议

1. ✅ 使用 Automation Token（不需要 2FA）
2. ✅ 定期更新 npm token
3. ✅ 不要在代码中硬编码 token
4. ✅ 使用 GitHub Secrets 存储敏感信息
5. ✅ 限制 token 权限（只给发布权限）

## 高级配置

### 仅在特定分支发布

```yaml
on:
  release:
    types: [created]
  push:
    branches:
      - main
    tags:
      - 'v*'
```

### 添加发布通知

```yaml
- name: Notify on success
  if: success()
  run: echo "Published successfully!"
```

### 发布到多个 registry

```yaml
- name: Publish to GitHub Packages
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 下一步

1. 设置 npm token
2. 添加 GitHub Secret
3. 推送配置文件
4. 创建第一个 Release 测试

完成后，每次创建 Release 就会自动发布到 npm！
