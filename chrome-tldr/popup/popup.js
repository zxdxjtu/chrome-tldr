// popup.js - Popup Script

class PopupUI {
  constructor() {
    this.init();
  }

  init() {
    this.bindMainEvents();
    console.log('TLDR Popup UI initialized');
  }

  bindMainEvents() {
    // 获取DOM元素
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const helpBtn = document.getElementById('helpBtn');

    // 绑定主界面事件
    if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.analyzePage());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearHighlights());
    if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());
    if (helpBtn) helpBtn.addEventListener('click', () => this.showHelp());
  }

  // 分析当前页面
  async analyzePage() {
    // 获取状态显示元素
    const statusEl = document.getElementById('status');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const resultEl = document.getElementById('result');
    const resultContentEl = document.getElementById('resultContent');

    try {
      // 显示加载状态
      if (loadingEl) {
        loadingEl.style.display = 'block';
      }
      if (statusEl) {
        statusEl.textContent = 'Analyzing...';
      }

      // 禁用分析按钮
      const analyzeBtn = document.getElementById('analyzeBtn');
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
      }

      // 隐藏错误信息
      if (errorEl) {
        errorEl.style.display = 'none';
      }

      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // 向content script发送分析请求
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });

      if (response.success) {
        // 显示分析结果
        if (resultContentEl) {
          resultContentEl.innerHTML = `
            <p><strong>Summary:</strong> ${response.result.summary}</p>
            <p><strong>Key Points:</strong></p>
            <ul>
              ${(response.result.keyPoints || []).map(point => `<li>${point}</li>`).join('')}
            </ul>
          `;
        }
        if (resultEl) {
          resultEl.style.display = 'block';
        }

        // 高亮页面内容
        await chrome.tabs.sendMessage(tab.id, {
          action: 'highlightContent',
          analysis: response.result
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      // 显示错误信息
      if (errorEl) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
      }
      if (statusEl) {
        statusEl.textContent = 'Error occurred';
      }
    } finally {
      // 隐藏加载状态
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
      // 启用分析按钮
      const analyzeBtn = document.getElementById('analyzeBtn');
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
      }
      if (statusEl) {
        statusEl.textContent = 'Ready to analyze content';
      }
    }
  }

  // 清除高亮
  async clearHighlights() {
    // 获取状态显示元素
    const statusEl = document.getElementById('status');
    const resultEl = document.getElementById('result');

    try {
      if (statusEl) {
        statusEl.textContent = 'Clearing highlights...';
      }

      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // 向content script发送清除高亮请求
      await chrome.tabs.sendMessage(tab.id, { action: 'clearHighlights' });

      if (statusEl) {
        statusEl.textContent = 'Highlights cleared';
      }
      if (resultEl) {
        resultEl.style.display = 'none';
      }
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = `Error: ${error.message}`;
      }
    }
  }

  // 打开设置页面
  openSettings() {
    // 创建设置界面
    this.showSettings();
  }

  // 显示设置界面
  showSettings() {
    const settingsHtml = `
      <div id="settingsPanel" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 1000;
        padding: 16px;
        box-sizing: border-box;
        overflow-y: auto;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        ">
          <h2 style="margin: 0; font-size: 18px;">Settings</h2>
          <button id="closeSettings" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">&times;</button>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            API Provider:
          </label>
          <select id="apiProvider" style="
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          ">
            <option value="openai">OpenAI</option>
            <option value="azure">Azure OpenAI</option>
            <option value="custom">Custom Endpoint</option>
          </select>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            API Key:
          </label>
          <input type="password" id="apiKey" placeholder="Enter your API key" style="
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            API Endpoint (for custom):
          </label>
          <input type="text" id="apiEndpoint" placeholder="https://api.example.com/v1" style="
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            Model:
          </label>
          <input type="text" id="model" placeholder="gpt-3.5-turbo" value="gpt-3.5-turbo" style="
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button id="saveSettings" style="
            flex: 1;
            padding: 10px;
            background: #1a73e8;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
          ">Save Settings</button>
          <button id="cancelSettings" style="
            flex: 1;
            padding: 10px;
            background: #f1f3f4;
            color: #333;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
          ">Cancel</button>
        </div>
        
        <div id="settingsStatus" style="
          margin-top: 16px;
          padding: 12px;
          border-radius: 4px;
          display: none;
        "></div>
      </div>
    `;

    // 添加设置界面到body
    document.body.innerHTML = settingsHtml + document.body.innerHTML;

    // 绑定设置界面事件
    setTimeout(() => {
      const closeSettingsBtn = document.getElementById('closeSettings');
      const cancelSettingsBtn = document.getElementById('cancelSettings');
      const saveSettingsBtn = document.getElementById('saveSettings');

      if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => this.hideSettings());
      if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', () => this.hideSettings());
      if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveSettings());

      // 加载现有配置
      this.loadSettings();
    }, 0);
  }

  // 隐藏设置界面
  hideSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
      settingsPanel.remove();
      // 重新绑定主界面事件
      this.bindMainEvents();
    }
  }

  // 加载设置
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getUserConfig' });
      if (response.success && response.config) {
        const config = response.config;
        const apiProviderEl = document.getElementById('apiProvider');
        const apiKeyEl = document.getElementById('apiKey');
        const apiEndpointEl = document.getElementById('apiEndpoint');
        const modelEl = document.getElementById('model');

        if (apiProviderEl && config.provider) apiProviderEl.value = config.provider;
        if (apiKeyEl && config.apiKey) apiKeyEl.value = config.apiKey;
        if (apiEndpointEl && config.endpoint) apiEndpointEl.value = config.endpoint;
        if (modelEl && config.model) modelEl.value = config.model;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // 保存设置
  async saveSettings() {
    const statusEl = document.getElementById('settingsStatus');
    const apiProviderEl = document.getElementById('apiProvider');
    const apiKeyEl = document.getElementById('apiKey');
    const apiEndpointEl = document.getElementById('apiEndpoint');
    const modelEl = document.getElementById('model');

    try {
      if (!apiProviderEl || !apiKeyEl || !apiEndpointEl || !modelEl) {
        throw new Error('Some settings elements are missing');
      }

      const config = {
        provider: apiProviderEl.value,
        apiKey: apiKeyEl.value,
        endpoint: apiEndpointEl.value,
        model: modelEl.value
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveUserConfig',
        config: config
      });

      if (response.success) {
        if (statusEl) {
          statusEl.textContent = 'Settings saved successfully!';
          statusEl.style.background = '#d4edda';
          statusEl.style.color = '#155724';
          statusEl.style.display = 'block';
        }

        // 2秒后隐藏成功消息并关闭设置面板
        setTimeout(() => {
          if (statusEl) {
            statusEl.style.display = 'none';
          }
          this.hideSettings();
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.style.background = '#f8d7da';
        statusEl.style.color = '#721c24';
        statusEl.style.display = 'block';
      }
    }
  }

  // 显示帮助信息
  showHelp() {
    alert('TLDR - Too Long, Do Read\n\n1. Click "Analyze Current Page" to summarize the content\n2. View key points in the popup or highlighted on the page\n3. Click "Clear Highlights" to remove highlights\n\nFor full functionality, configure your AI service API key in Settings.');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});