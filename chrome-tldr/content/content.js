// content.js - Content Script

class ContentScript {
  constructor() {
    this.init();
  }

  init() {
    // 监听来自background和popup的消息
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    console.log('TLDR Content Script initialized');
  }

  // 处理消息
  handleMessage(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    switch (request.action) {
      case 'analyzePage':
        this.analyzePage()
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
        
      case 'analyzeSelection':
        this.analyzeSelection(request.selectionText)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
        
      case 'highlightContent':
        this.highlightContent(request.analysis)
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
        
      case 'clearHighlights':
        this.clearHighlights()
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  // 分析当前页面
  async analyzePage() {
    // 提取页面主要内容
    const content = this.extractContent();
    
    // 发送到background script进行AI分析
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'analyzeContent', content: content },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.success) {
            resolve(response.result);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }

  // 分析选中内容
  async analyzeSelection(selectionText) {
    // 发送到background script进行AI分析
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'analyzeContent', content: selectionText },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.success) {
            resolve(response.result);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }

  // 提取页面内容
  extractContent() {
    // 简化版内容提取，实际项目中可以集成Readability.js
    const title = document.title;
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(text => text.length > 50); // 过滤掉太短的段落
    
    // 合并前几个段落作为主要内容
    const mainContent = paragraphs.slice(0, 10).join('\n\n');
    
    return {
      title: title,
      content: mainContent,
      url: window.location.href
    };
  }

  // 高亮内容
  async highlightContent(analysis) {
    // 清除现有高亮
    this.clearHighlights();
    
    // 简单实现：高亮页面中的关键词
    if (analysis.keywords && analysis.keywords.length > 0) {
      this.highlightKeywords(analysis.keywords);
    }
    
    // 创建浮动面板显示分析结果
    this.createFloatingPanel(analysis);
  }

  // 高亮关键词
  highlightKeywords(keywords) {
    // 创建一个包含所有关键词的正则表达式
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    
    // 遍历所有文本节点
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // 在匹配的文本上添加高亮
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      if (keywordRegex.test(text)) {
        const highlightedText = text.replace(keywordRegex, '<span class="tldr-highlight">$1</span>');
        const span = document.createElement('span');
        span.innerHTML = highlightedText;
        textNode.parentNode.replaceChild(span, textNode);
      }
    });
  }

  // 创建浮动面板显示分析结果
  createFloatingPanel(analysis) {
    // 移除已存在的面板
    const existingPanel = document.getElementById('tldr-floating-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // 创建浮动面板
    const panel = document.createElement('div');
    panel.id = 'tldr-floating-panel';
    panel.className = 'tldr-panel';
    
    panel.innerHTML = `
      <div class="tldr-panel-header">
        <h3>TLDR Analysis</h3>
        <button class="tldr-close-btn">&times;</button>
      </div>
      <div class="tldr-panel-content">
        <div class="tldr-summary">
          <h4>Summary</h4>
          <p>${analysis.summary}</p>
        </div>
        <div class="tldr-key-points">
          <h4>Key Points</h4>
          <ul>
            ${(analysis.keyPoints || []).map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    // 添加关闭按钮事件
    panel.querySelector('.tldr-close-btn').addEventListener('click', () => {
      panel.remove();
    });
    
    // 添加面板到页面
    document.body.appendChild(panel);
    
    // 添加拖拽功能
    this.makeDraggable(panel);
  }

  // 使面板可拖拽
  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.querySelector('.tldr-panel-header').onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // 获取鼠标位置
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // 计算新位置
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // 设置元素新位置
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      // 停止移动
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // 清除高亮
  clearHighlights() {
    // 移除高亮的span标签
    const highlights = document.querySelectorAll('.tldr-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    });
    
    // 移除浮动面板
    const panel = document.getElementById('tldr-floating-panel');
    if (panel) {
      panel.remove();
    }
    
    return Promise.resolve();
  }
}

// 初始化Content Script
const contentScript = new ContentScript();