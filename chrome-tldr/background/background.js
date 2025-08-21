// background.js - Background Service Worker

class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    // 监听来自content script和popup的消息
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // 创建上下文菜单
    this.createContextMenu();
    
    console.log('TLDR Background Service initialized');
  }

  // 处理消息
  handleMessage(request, sender, sendResponse) {
    console.log('Received message:', request);
    
    switch (request.action) {
      case 'analyzeContent':
        this.analyzeContent(request.content)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // 保持消息通道开放以进行异步响应
        
      case 'getUserConfig':
        this.getUserConfig()
          .then(config => sendResponse({ success: true, config }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
        
      case 'saveUserConfig':
        this.saveUserConfig(request.config)
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  // 创建上下文菜单
  async createContextMenu() {
    chrome.contextMenus.create({
      id: 'tldr-analyze-selection',
      title: 'TLDR Analyze Selection',
      contexts: ['selection']
    });
    
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'tldr-analyze-selection') {
        // 发送消息到content script处理选中内容
        chrome.tabs.sendMessage(tab.id, {
          action: 'analyzeSelection',
          selectionText: info.selectionText
        });
      }
    });
  }

  // 分析内容 - 这里将调用AI服务
  async analyzeContent(content) {
    // 获取用户配置
    const config = await this.getUserConfig();
    
    // 如果没有配置API密钥，则返回本地处理结果
    if (!config.apiKey) {
      return {
        summary: "Local processing result (AI service not configured)",
        keyPoints: [
          "Content extracted successfully",
          "Configure AI service for deeper analysis",
          "This is a sample local processing result"
        ],
        keywords: ["TLDR", "Local", "Processing"]
      };
    }
    
    // 如果配置了API密钥，则调用AI服务
    try {
      // 构建提示词
      const prompt = this.buildPrompt(content);
      
      // 调用AI服务
      const result = await this.callAIService(config, prompt);
      
      return result;
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  // 构建提示词
  buildPrompt(content) {
    const contentText = typeof content === 'string' ? content : content.content;
    
    return `Please analyze the following text and provide a summary in this exact format:
Summary: [A brief summary of the content in one sentence]
Key Points:
- [Key point 1]
- [Key point 2]
- [Key point 3]

Text to analyze:
${contentText}`;
  }

  // 调用AI服务
  async callAIService(config, prompt) {
    // 确定API端点和头部信息
    let apiUrl, headers;
    
    switch (config.provider) {
      case 'azure':
        // Azure OpenAI格式
        apiUrl = config.endpoint || 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15';
        headers = {
          'Content-Type': 'application/json',
          'api-key': config.apiKey
        };
        break;
        
      case 'custom':
        // 自定义端点
        apiUrl = config.endpoint || 'http://localhost:8000/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        };
        break;
        
      case 'openai':
      default:
        // OpenAI格式
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        };
        break;
    }
    
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // 解析响应
    const analysisText = data.choices[0].message.content;
    return this.parseAIResponse(analysisText);
  }

  // 解析AI响应
  parseAIResponse(text) {
    const lines = text.trim().split('\n');
    
    let summary = '';
    const keyPoints = [];
    
    for (const line of lines) {
      if (line.startsWith('Summary:')) {
        summary = line.substring(8).trim();
      } else if (line.startsWith('- ')) {
        keyPoints.push(line.substring(2).trim());
      }
    }
    
    return {
      summary: summary || 'No summary available',
      keyPoints: keyPoints.length > 0 ? keyPoints : ['No key points extracted'],
      keywords: [] // 可以在后续版本中实现关键词提取
    };
  }

  // 获取用户配置
  async getUserConfig() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['tldrConfig'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result.tldrConfig || {});
        }
      });
    });
  }

  // 保存用户配置
  async saveUserConfig(config) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ tldrConfig: config }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
}

// 初始化后台服务
const backgroundService = new BackgroundService();