# Chrome Extension Installation & Usage Guide

## 📋 Table of Contents
- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Configuration Guide](#configuration-guide)
- [Usage Instructions](#usage-instructions)
- [Troubleshooting](#troubleshooting)
- [Uninstallation Guide](#uninstallation-guide)

## 📦 System Requirements

### Browser Requirements
- **Chrome 88+** or Chromium-based browsers (Edge, Brave, etc.)
- Support for Chrome Extension Manifest V3

### AI Service Requirements
API key from one of the following AI services:
- **OpenAI API** (Recommended)
- **Azure OpenAI Service**
- **Alibaba Cloud Qwen**
- **Other OpenAI-compatible API services**

## 🚀 Installation Steps

### Method 1: Developer Mode Loading (Recommended)

1. **Download Source Code**
   ```bash
   # Option 1: Git clone
   git clone https://github.com/your-username/chrome-tldr.git
   
   # Option 2: Download ZIP package and extract
   # Download ZIP file from GitHub and extract to local folder
   ```

2. **Open Chrome Extensions Management Page**
   - Enter in Chrome address bar: `chrome://extensions/`
   - Or click: Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner of the extensions page

4. **Load Extension**
   - Click "Load unpacked" button
   - Select the `chrome-tldr` directory from the project folder
   - Click "Select Folder"

5. **Verify Installation**
   - Extension should appear in the extensions list
   - TLDR icon will be visible in browser toolbar
   - Status should show "Enabled"

### Method 2: Packaged Installation

1. **Pack Extension**
   - On extensions management page, click "Pack extension"
   - Select the `chrome-tldr` folder
   - Generate `.crx` file

2. **Install Packaged File**
   - Drag and drop the `.crx` file to the extensions page
   - Confirm installation prompt

## ⚙️ Configuration Guide

### Initial Configuration

1. **Open Settings Interface**
   - Click the TLDR icon in browser toolbar
   - Click "Settings" button

2. **Select AI Service Provider**
   - **OpenAI**: Official OpenAI service
   - **Azure**: Azure OpenAI service
   - **Qwen**: Alibaba Cloud Qwen
   - **Custom**: Custom API endpoint

3. **Configure API Parameters**

   **OpenAI Configuration:**
   ```
   API Provider: OpenAI
   API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
   Model: gpt-3.5-turbo (or gpt-4)
   API Endpoint: https://api.openai.com/v1/chat/completions
   ```

   **Azure OpenAI Configuration:**
   ```
   API Provider: Azure
   API Key: your-azure-api-key
   Model: your-deployment-name
   API Endpoint: https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
   ```

   **Qwen Configuration:**
   ```
   API Provider: Qwen
   API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
   Model: qwen-turbo (or other models)
   API Endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
   ```

4. **Save Configuration**
   - Click "Save Settings" button
   - "Settings saved successfully!" message indicates successful configuration

### API Key Acquisition Guide

**OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Register/login to account
3. Go to API Keys page
4. Click "Create new secret key"
5. Copy the generated key

**Azure OpenAI:**
1. Login to [Azure Portal](https://portal.azure.com/)
2. Create Azure OpenAI resource
3. Get API key and endpoint from "Keys and Endpoint" page

**Qwen:**
1. Visit [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Enable service and get API Key
3. Check API documentation for correct endpoint address

## 📖 Usage Instructions

### Basic Usage Flow

1. **Visit Article Page**
   - Open any webpage with long articles
   - Ensure page is fully loaded

2. **Start Analysis**
   - Click TLDR icon in browser toolbar
   - Click "Analyze Current Page" button
   - Wait for AI analysis (usually 5-15 seconds)

3. **View Results**
   - **Popup Window**: Shows article summary and key points
   - **Page Highlighting**: Important content will be highlighted
   - **Visual Hierarchy**: Content transparency adjusted by importance

### Advanced Feature Usage

**Jump to Content:**
- Click "Jump to Content" button to automatically scroll to article start

**Sidebar Mode:**
- Click "Sidebar Mode" to open fixed sidebar
- Drag to adjust sidebar width
- Shows detailed analysis results and keyword tags

**Interactive Features:**
- **Hover Restoration**: Mouse hover on highlighted content to see original style
- **Toggle Display**: Use "Toggle Highlights" and "Toggle Hierarchy" buttons in sidebar
- **Clear Highlights**: Click "Clear Highlights" to restore page original state

### Supported Website Types

**News Websites:**
- CNN, BBC, Xinhua News, People's Daily and other mainstream news sites
- Local news websites and vertical news platforms

**Blog Platforms:**
- Medium, Jianshu, CSDN, Cnblogs, etc.
- Personal blogs and tech blogs

**Academic Websites:**
- arXiv, IEEE, ACM and other academic journals
- University and research institution websites

**Technical Documentation:**
- GitHub, Stack Overflow, MDN, etc.
- Official technical documentation and API docs

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. Extension Icon Not Showing**
- Check if extension is properly installed and enabled
- Refresh browser or restart Chrome
- Confirm extension permissions are set correctly

**2. API Call Failure**
- Check if API key is correctly configured
- Confirm API service provider and endpoint settings
- Check network connection and firewall settings
- Check browser console error messages

**3. Content Cannot Be Highlighted**
- Confirm page contains sufficient text content
- Check if website uses complex JavaScript rendering
- Try waiting for page to fully load before analysis
- Clear browser cache and retry

**4. Inaccurate Analysis Results**
- Try different AI models (e.g., switch from gpt-3.5-turbo to gpt-4)
- Check if article language is correctly identified
- Confirm if article content is suitable for AI analysis

**5. Slow Extension Performance**
- Check if article length is too long
- Confirm stable network connection
- Close other resource-intensive extensions

### Debugging Guide

**Enable Developer Tools:**
1. Right-click TLDR icon → "Inspect popup"
2. Press F12 on any page to open developer tools
3. Check error messages in Console tab

**View Extension Logs:**
1. Visit `chrome://extensions/`
2. Find TLDR extension, click "background page"
3. View logs in opened developer tools

## 🗑️ Uninstallation Guide

### Complete Uninstallation Steps

1. **Remove Extension**
   - Visit `chrome://extensions/`
   - Find TLDR extension
   - Click "Remove" button
   - Confirm deletion

2. **Clean Data**
   - Chrome automatically cleans extension data
   - For manual cleanup, clear browser storage data

3. **Delete Source Files**
   - Delete local project folder
   - Clean downloaded installation packages

## 📞 Technical Support

**Get Help:**
- GitHub Issues: [Submit Issues](https://github.com/your-username/chrome-tldr/issues)
- Project Documentation: [View README](README_EN.md)
- Email Support: your-email@example.com

**Report Bugs:**
Please provide the following information:
- Chrome version number
- Operating system information
- Error reproduction steps
- Console error logs
- Problem screenshots

---

💡 **Tip**: If you encounter issues during use, please first check the troubleshooting section of this document - most problems can be quickly resolved!