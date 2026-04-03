# vc-design 云端发布与同步说明

本文说明如何把 vc-design 组件库发布到云端，实现**修改可同步**、**他人可访问**。

---

## 方案一：发布到 npm 公共仓库（推荐）

适用：包名可公开、希望任何人通过 `npm install vc-design` 使用。

### 1. 前置准备

- 在 [npmjs.com](https://www.npmjs.com) 注册账号。
- 本机登录：终端执行 `npm login`，按提示输入用户名、密码、邮箱；若启用 2FA，按提示输入 OTP。
- 确认 registry 为官方源：`npm config get registry` 应显示 `https://registry.npmjs.org/`。

### 2. 发布前检查

```bash
npm run clean && npm run build   # 构建
npm publish --dry-run            # 查看将要发布的文件列表，不真正发布
```

### 3. 发布

```bash
npm publish
```

首次发布后，包会出现在 https://www.npmjs.com/package/vc-design 。

### 4. 后续修改如何同步（版本迭代）

每次改完代码并测试通过后，按语义化版本更新并发布：

```bash
# 修复 bug / 小改动
npm run release:patch    # 0.1.0 → 0.1.1 并自动 publish

# 或手动控制版本与发布
npm version patch       # 仅改版本号
npm publish             # 再发布
```

- **patch**：修复、小改动（0.1.0 → 0.1.1）
- **minor**：新功能、兼容旧版（0.1.0 → 0.2.0）：`npm run release:minor`
- **major**：不兼容变更（0.1.0 → 1.0.0）：`npm run release:major`

### 5. 其他人如何安装与更新

```bash
# 安装最新版
npm install vc-design

# 安装指定版本
npm install vc-design@0.1.0

# 更新到最新
npm update vc-design
# 或在 package.json 中改版本号后 npm install
```

无需 token，只要能访问 npm 官方源即可。

---

## 方案二：私有 npm 或自建 Registry

适用：仅限公司/团队内使用、不能公开到公共 npm。

### 选项 A：npm 付费私有包

- 在 npm 购买私有包或团队方案。
- 包名建议使用 scope，如 `@你的组织/vc-design`。
- 在 `package.json` 中把 `"name"` 改为 `"@你的组织/vc-design"`，`publishConfig` 已设 `"access": "public"`，私有包会忽略该设置。
- 发布：`npm publish --access restricted`（或按 npm 文档）。
- 他人安装：先 `npm login` 用有权限的账号登录，再 `npm install @你的组织/vc-design`。

### 选项 B：自建私有 Registry（如 Verdaccio、阿里云效、腾讯 CODING 等）

1. 在自建 registry 中创建仓库（如 `vc-design` 或 `@org/vc-design`）。
2. 项目根目录新建 `.npmrc`，指定发布地址，例如：
   ```ini
   registry=https://你的registry地址/
   # 若需要认证，再配置：
   # //你的registry地址/:_authToken=xxx
   ```
3. 发布：`npm publish`（或按该 registry 文档的发布方式）。
4. 他人：在该 registry 有权限的前提下，在项目中配置使用该 registry（或仅对该包做 scope 映射），然后：
   ```bash
   npm install vc-design
   # 或
   npm install @你的组织/vc-design
   ```

**同步方式**：与方案一相同，改代码 → `npm version patch/minor/major` → `npm publish`；可选配合 CI 在打 git tag 时自动发布。

---

## 方案三：仅用 Git 仓库（不经过 npm）

适用：不想用 npm、代码在 GitHub/GitLab 等，且能接受用 Git 依赖安装。

- 把代码推到远程仓库（如 `https://github.com/你的组织/vc-design`）。
- 发布新版本时打 tag，例如：`git tag v0.1.0 && git push origin v0.1.0`。
- 他人安装：
  ```bash
  npm install git+https://github.com/你的组织/vc-design.git#v0.1.0
  ```
  或在 `package.json` 中：
  ```json
  "vc-design": "github:你的组织/vc-design#v0.1.0"
  ```
- **同步**：你改代码后 push，并打新 tag（如 `v0.1.1`）；他人把依赖中的 tag 或分支改为新版本再 `npm install`。

缺点：依赖安装和版本管理不如 npm 规范，且需要仓库可访问权限（私有库需配置 Git 凭据）。

---

## 推荐选择

| 需求                     | 建议方案     |
|--------------------------|--------------|
| 对外开源、任何人可安装   | 方案一：npm 公共 |
| 仅公司/团队内、要权限控制 | 方案二：私有 npm 或自建 Registry |
| 暂不搞 npm、仅 Git 共享  | 方案三：Git + tag |

当前 `package.json` 已配置：

- `files: ["dist", "README.md"]`：只把构建产物和 README 发出去。
- `publishConfig.access: "public"`：若使用 scope 包名（如 `@org/vc-design`）时默认按公共包发布；私有包需在发布时加 `--access restricted`。
- `prepublishOnly`：执行 `npm publish` 前会自动 `clean` 并 `build`。
- `release:patch / release:minor / release:major`：一键改版本并发布，便于后续修改保持同步。

按上面选定方案操作即可实现「云端打包、修改同步、他人可访问」。
