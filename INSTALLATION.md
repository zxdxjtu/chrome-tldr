# Chrome 扩展安装与使用指南

## 📋 目录
- [系统要求](#系统要求)
- [安装步骤](#安装步骤)
- [配置指南](#配置指南)
- [使用说明](#使用说明)
- [故障排除](#故障排除)
- [卸载指南](#卸载指南)

## 📦 系统要求

### 浏览器要求
- **Chrome 88+** 或基于Chromium的浏览器（Edge、Brave等）
- 支持 Chrome Extension Manifest V3

### AI服务要求
需要以下任一AI服务的API密钥：
- **OpenAI API** (推荐)
- **Azure OpenAI Service**
- **阿里云通义千问 (Qwen)**
- **其他兼容OpenAI格式的API服务**

## 🚀 安装步骤

### 方法一：开发者模式加载（推荐）

1. **下载源码**
   ```bash
   # 方式1：Git克隆
   git clone https://github.com/your-username/chrome-tldr.git
   
   # 方式2：下载ZIP包并解压
   # 从GitHub下载ZIP文件并解压到本地文件夹
   ```

2. **打开Chrome扩展管理页面**
   - 在Chrome地址栏输入：`chrome://extensions/`
   - 或点击：菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 在扩展管理页面右上角，开启"开发者模式"开关

4. **加载扩展**
   - 点击"加载已解压的扩展程序"按钮
   - 选择项目文件夹中的 `chrome-tldr` 目录
   - 点击"选择文件夹"

5. **验证安装**
   - 扩展应该出现在扩展列表中
   - 浏览器工具栏会显示TLDR图标
   - 状态显示为"已启用"

### 方法二：打包安装

1. **打包扩展**
   - 在扩展管理页面，点击"打包扩展程序"
   - 选择 `chrome-tldr` 文件夹
   - 生成 `.crx` 文件

2. **安装打包文件**
   - 将 `.crx` 文件拖拽到扩展管理页面
   - 确认安装提示

## ⚙️ 配置指南

### 首次配置

1. **打开设置界面**
   - 点击浏览器工具栏中的TLDR图标
   - 点击"Settings"按钮

2. **选择AI服务商**
   - **OpenAI**: 官方OpenAI服务
   - **Azure**: Azure OpenAI服务
   - **Qwen**: 阿里云通义千问
   - **Custom**: 自定义API端点

3. **配置API参数**

   **OpenAI配置:**
   ```
   API Provider: OpenAI
   API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
   Model: gpt-3.5-turbo (或 gpt-4)
   API Endpoint: https://api.openai.com/v1/chat/completions
   ```

   **Azure OpenAI配置:**
   ```
   API Provider: Azure
   API Key: your-azure-api-key
   Model: your-deployment-name
   API Endpoint: https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
   ```

   **通义千问配置:**
   ```
   API Provider: Qwen
   API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
   Model: qwen-turbo (或其他模型)
   API Endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
   ```

4. **保存配置**
   - 点击"Save Settings"按钮
   - 看到"Settings saved successfully!"提示即配置成功

### API密钥获取指南

**OpenAI API密钥:**
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账户
3. 进入 API Keys 页面
4. 点击"Create new secret key"
5. 复制生成的密钥

**Azure OpenAI:**
1. 登录 [Azure Portal](https://portal.azure.com/)
2. 创建 Azure OpenAI 资源
3. 在"密钥和端点"页面获取API密钥和端点

**通义千问:**
1. 访问 [阿里云DashScope](https://dashscope.aliyun.com/)
2. 开通服务并获取API Key
3. 查看API文档获取正确的端点地址

## 📖 使用说明

### 基础使用流程

1. **访问文章页面**
   - 打开任意包含长文的网页
   - 确保页面已完全加载

2. **启动分析**
   - 点击浏览器工具栏中的TLDR图标
   - 点击"Analyze Current Page"按钮
   - 等待AI分析（通常5-15秒）

3. **查看结果**
   - **Popup窗口**: 显示文章摘要和关键点
   - **页面高亮**: 重要内容会被高亮显示
   - **视觉层次**: 内容根据重要性调整透明度

### 高级功能使用

**跳转正文:**
- 点击"跳转正文"按钮自动滚动到文章开始位置

**侧边栏模式:**
- 点击"侧边栏模式"打开固定侧边栏
- 拖拽调整侧边栏宽度
- 显示详细的分析结果和关键词标签

**交互功能:**
- **悬停还原**: 鼠标悬停在高亮内容上查看原始样式
- **切换显示**: 在侧边栏中使用"切换高亮"和"切换层次"按钮
- **清除高亮**: 点击"Clear Highlights"恢复页面原状

### 支持的网站类型

**新闻网站:**
- CNN, BBC, 新华网, 人民网等主流新闻站点
- 地方新闻网站和垂直新闻平台

**博客平台:**
- Medium, 简书, CSDN, 博客园等
- 个人博客和技术博客

**学术网站:**
- arXiv, IEEE, ACM等学术期刊
- 大学和研究机构网站

**技术文档:**
- GitHub, Stack Overflow, MDN等
- 官方技术文档和API文档

## 🔧 故障排除

### 常见问题及解决方案

**1. 扩展图标不显示**
- 检查扩展是否正确安装和启用
- 刷新浏览器或重启Chrome
- 确认扩展权限设置正确

**2. API调用失败**
- 检查API密钥是否正确配置
- 确认API服务商和端点设置
- 检查网络连接和防火墙设置
- 查看浏览器控制台错误信息

**3. 内容无法高亮**
- 确认页面包含足够的文本内容
- 检查网站是否使用复杂的JavaScript渲染
- 尝试等待页面完全加载后再分析
- 清除浏览器缓存后重试

**4. 分析结果不准确**
- 尝试不同的AI模型（如从gpt-3.5-turbo切换到gpt-4）
- 检查文章语言是否被正确识别
- 确认文章内容是否适合AI分析

**5. 扩展运行缓慢**
- 检查文章长度是否过长
- 确认网络连接稳定
- 关闭其他占用资源的扩展

### 调试指南

**开启开发者工具:**
1. 右键点击TLDR图标 → "检查弹出内容"
2. 在任意页面按F12打开开发者工具
3. 查看Console标签页的错误信息

**查看扩展日志:**
1. 访问 `chrome://extensions/`
2. 找到TLDR扩展，点击"背景页"
3. 在打开的开发者工具中查看日志

## 🗑️ 卸载指南

### 完全卸载步骤

1. **移除扩展**
   - 访问 `chrome://extensions/`
   - 找到TLDR扩展
   - 点击"移除"按钮
   - 确认删除

2. **清理数据**
   - Chrome会自动清理扩展数据
   - 如需手动清理，可清除浏览器存储数据

3. **删除源文件**
   - 删除本地的项目文件夹
   - 清理下载的安装包

## 📞 技术支持

**获取帮助:**
- GitHub Issues: [提交问题](https://github.com/your-username/chrome-tldr/issues)
- 项目文档: [查看README](README.md)
- 邮件支持: your-email@example.com

**报告Bug:**
请提供以下信息：
- Chrome版本号
- 操作系统信息
- 错误复现步骤
- 控制台错误日志
- 问题截图

---

💡 **提示**: 如果在使用过程中遇到问题，请先查看本文档的故障排除部分，大多数问题都能快速解决！