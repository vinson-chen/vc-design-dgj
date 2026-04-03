# Upload 上传 组件规范（vc-design）

基于 Ant Design 5 的 Upload，文件选择上传和拖拽上传控件。

---

## 1. 何时使用

- 需要上传一个或一些文件时。
- 需要展示上传进度时。
- 需要使用拖拽交互时。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **action** | 上传地址 | string \| (file) => Promise\<string\> | - |
| **fileList** / **defaultFileList** | 已上传列表（受控）/ 默认列表 | UploadFile[] | - |
| **beforeUpload** | 上传前钩子，返回 false 或 Promise 可阻止上传 | (file, fileList) => boolean \| Promise \| LIST_IGNORE | - |
| **customRequest** | 自定义上传实现 | (options, info) => void | - |
| **accept** | 接受的文件类型（同 input accept） | string | - |
| **multiple** | 是否多选 | boolean | false |
| **maxCount** | 最大上传数量，为 1 时替换当前文件 | number | - |
| **listType** | 列表样式 | `'text'` \| `'picture'` \| `'picture-card'` \| `'picture-circle'` | `'text'` |
| **showUploadList** | 是否展示文件列表 | boolean \| object | true |
| **disabled** | 禁用 | boolean | false |
| **onChange** | 文件状态改变 | ({ file, fileList, event }) => void | - |
| **onPreview** / **onRemove** | 预览 / 移除回调 | (file) => void | - |

---

## 3. UploadFile

name, uid, status（uploading / done / error / removed）, percent, url, thumbUrl 等。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
