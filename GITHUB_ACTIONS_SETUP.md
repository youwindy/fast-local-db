# GitHub Actions 自动发布设置

## 快速设置（3 步）

### 1. 创建 npm 令牌

访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
- 点击 "Generate New Token"
- 选择 "Automation" 类型
- 复制令牌

### 2. 添加 GitHub Secret

在 GitHub 仓库：
- Settings > Secrets and variables > Actions
- New repository secret
- Name: `NPM_TOKEN`
- Value: 粘贴 npm 令牌

### 3. 创建 Release 发布

```bash
# 方式 1：GitHub 网页
# 访问仓库 > Releases > Create a new release
# Tag: v1.1.0
# Title: v1.1.0
# 点击 Publish release

# 方式 2：命令行
gh release create v1.1.0 --title "v1.1.0" --notes "Release notes"
```

## 自动化流程

创建 Release 后自动：
1. ✅ 运行测试
2. ✅ 构建项目
3. ✅ 发布到 npm

## 版本发布流程

```bash
# 1. 更新版本
npm version patch  # 1.1.0 -> 1.1.1

# 2. 提交推送
git push && git push --tags

# 3. 创建 Release（触发自动发布）
gh release create v1.1.1 --title "v1.1.1" --notes "Bug fixes"
```

完成！每次创建 Release 就会自动发布到 npm。
