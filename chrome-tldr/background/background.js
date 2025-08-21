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
    console.log('analyzeContent loaded config:', config);
    
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
    
    return `请分析以下文本内容，并按照指定格式提供摘要，请使用中文回答：

总结: [一句话概括内容要点]
关键点:
- [关键点1]
- [关键点2]  
- [关键点3]

请分析的文本内容：
${contentText}`;
  }

  // 调用AI服务
  async callAIService(config, prompt) {
    // 添加调试日志
    console.log('callAIService config:', config);
    
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
        
      case 'qwen':
        // 通义千问 DashScope API
        apiUrl = config.endpoint || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        };
        break;
        
      case 'openai':
      default:
        // OpenAI格式
        apiUrl = config.endpoint || 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        };
        break;
    }
    
    // 添加更多调试日志
    console.log('Final apiUrl:', apiUrl);
    console.log('Final headers:', headers);
    
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
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        errorText: errorText
      });
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
      if (line.startsWith('总结:') || line.startsWith('Summary:')) {
        summary = line.substring(line.indexOf(':') + 1).trim();
      } else if (line.startsWith('- ')) {
        keyPoints.push(line.substring(2).trim());
      }
    }
    
    return {
      summary: summary || '暂无可用摘要',
      keyPoints: keyPoints.length > 0 ? keyPoints : ['暂无提取到关键点'],
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