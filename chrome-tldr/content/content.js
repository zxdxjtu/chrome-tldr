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
      
      case 'jumpToContent':
        this.scrollToMainContent();
        sendResponse({ success: true });
        return true;
        
      case 'toggleSidebarMode':
        this.toggleSidebarMode();
        sendResponse({ success: true });
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
            reject(new Error(`Connection failed: ${chrome.runtime.lastError.message}`));
          } else if (response && response.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || 'Unknown error occurred'));
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
            reject(new Error(`Connection failed: ${chrome.runtime.lastError.message}`));
          } else if (response && response.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || 'Unknown error occurred'));
          }
        }
      );
    });
  }

  // 提取页面内容
  extractContent() {
    // 使用更智能的内容提取算法
    const title = this.extractTitle();
    const content = this.extractMainContent();
    const metadata = this.extractMetadata();
    
    return {
      title: title,
      content: content.text,
      sections: content.sections,
      metadata: metadata,
      url: window.location.href,
      wordCount: content.text.split(/\s+/).length
    };
  }

  // 提取标题
  extractTitle() {
    // 优先级：文章标题 > h1 > 页面标题
    const articleTitle = document.querySelector('article h1, .article-title, .post-title, .entry-title');
    if (articleTitle && articleTitle.textContent.trim()) {
      return articleTitle.textContent.trim();
    }
    
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) {
      return h1.textContent.trim();
    }
    
    return document.title;
  }

  // 提取元数据
  extractMetadata() {
    const metadata = {};
    
    // 提取作者
    const authorSelectors = [
      '.author', '.by-author', '.post-author', '[rel="author"]',
      '.byline', '.article-author', 'meta[name="author"]'
    ];
    
    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.author = element.getAttribute('content') || element.textContent.trim();
        break;
      }
    }
    
    // 提取发布时间
    const dateSelectors = [
      'time[datetime]', '.publish-date', '.post-date', '.article-date',
      '.date', '[data-timestamp]', 'meta[property="article:published_time"]'
    ];
    
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.publishDate = element.getAttribute('datetime') || 
                              element.getAttribute('content') || 
                              element.textContent.trim();
        break;
      }
    }
    
    return metadata;
  }

  // 提取主要内容（增强版）
  extractMainContent() {
    // 第一步：尝试找到文章容器
    const contentContainer = this.findContentContainer();
    
    if (contentContainer) {
      return this.extractFromContainer(contentContainer);
    }
    
    // 第二步：如果没找到容器，使用启发式方法
    return this.extractUsingHeuristics();
  }

  // 找到文章容器
  findContentContainer() {
    // 语义化HTML5标签
    const semanticSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.main-content',
      '#main-content'
    ];
    
    for (const selector of semanticSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isValidContentContainer(element)) {
        return element;
      }
    }
    
    // 常见的内容区域类名
    const contentSelectors = [
      '.content', '.post-content', '.entry-content', '.article-content',
      '.post-body', '.article-body', '.content-body', '.main-article',
      '.story-body', '.article-text', '.post-text'
    ];
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isValidContentContainer(element)) {
        return element;
      }
    }
    
    return null;
  }

  // 验证容器是否有效
  isValidContentContainer(element) {
    const text = element.textContent.trim();
    
    // 检查文本长度
    if (text.length < 100) return false;
    
    // 检查段落数量
    const paragraphs = element.querySelectorAll('p');
    if (paragraphs.length < 2) return false;
    
    // 检查是否包含导航或广告元素
    const excludeSelectors = [
      '.nav', '.navbar', '.navigation', '.menu',
      '.sidebar', '.aside', '.widget',
      '.advertisement', '.ad', '.ads',
      '.comment', '.comments', '.social'
    ];
    
    for (const selector of excludeSelectors) {
      if (element.matches(selector) || element.querySelector(selector)) {
        const excludeContent = element.querySelector(selector);
        if (excludeContent && excludeContent.textContent.length > text.length * 0.3) {
          return false; // 如果排除内容占比过大，认为不适合
        }
      }
    }
    
    return true;
  }

  // 从容器中提取内容
  extractFromContainer(container) {
    // 移除干扰元素
    const cleanContainer = this.removeNoiseElements(container.cloneNode(true));
    
    // 提取段落和结构
    const sections = this.extractSections(cleanContainer);
    const text = sections.map(section => section.text).join('\n\n');
    
    return {
      text: text,
      sections: sections
    };
  }

  // 移除干扰元素
  removeNoiseElements(container) {
    const noiseSelectors = [
      // 导航和菜单
      'nav', '.nav', '.navbar', '.navigation', '.menu',
      // 侧边栏和小工具
      '.sidebar', '.aside', '.widget', '.widgets',
      // 广告
      '.advertisement', '.ad', '.ads', '.banner',
      // 评论和社交
      '.comment', '.comments', '.social', '.share',
      // 页脚和版权
      'footer', '.footer', '.copyright',
      // 其他干扰元素
      '.related', '.recommended', '.trending',
      'script', 'style', 'noscript'
    ];
    
    noiseSelectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    return container;
  }

  // 提取章节结构
  extractSections(container) {
    const sections = [];
    const elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');
    
    let currentSection = null;
    
    elements.forEach(element => {
      const text = element.textContent.trim();
      if (!text) return;
      
      const tagName = element.tagName.toLowerCase();
      
      if (tagName.match(/^h[1-6]$/)) {
        // 标题元素，开始新章节
        currentSection = {
          type: 'heading',
          level: parseInt(tagName.charAt(1)),
          text: text,
          content: []
        };
        sections.push(currentSection);
      } else {
        // 内容元素
        const contentItem = {
          type: this.getContentType(element),
          text: text
        };
        
        if (currentSection) {
          currentSection.content.push(contentItem);
        } else {
          // 如果没有当前章节，创建一个默认章节
          currentSection = {
            type: 'content',
            text: '',
            content: [contentItem]
          };
          sections.push(currentSection);
        }
      }
    });
    
    // 合并章节文本
    sections.forEach(section => {
      if (section.content && section.content.length > 0) {
        section.text += '\n' + section.content.map(item => item.text).join('\n');
      }
    });
    
    return sections.filter(section => section.text.length > 30); // 过滤过短的章节
  }

  // 获取内容类型
  getContentType(element) {
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'p':
        return 'paragraph';
      case 'li':
        return 'list_item';
      case 'blockquote':
        return 'quote';
      default:
        return 'text';
    }
  }

  // 使用启发式方法提取内容（回退方案）
  extractUsingHeuristics() {
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .filter(p => {
        const text = p.textContent.trim();
        return text.length > 50 && // 过滤过短的段落
               !this.isInNoiseElement(p); // 过滤干扰元素中的段落
      })
      .map(p => p.textContent.trim());
    
    // 取前15个段落作为主要内容
    const mainContent = paragraphs.slice(0, 15).join('\n\n');
    
    const sections = paragraphs.map((text, index) => ({
      type: 'paragraph',
      text: text,
      index: index
    }));
    
    return {
      text: mainContent,
      sections: sections
    };
  }

  // 检查元素是否在干扰元素中
  isInNoiseElement(element) {
    const noiseSelectors = [
      'nav', '.nav', '.navbar', '.menu',
      'header', '.header', 'footer', '.footer',
      '.sidebar', '.aside', '.advertisement', '.ad'
    ];
    
    return noiseSelectors.some(selector => element.closest(selector));
  }

  // 高亮内容
  async highlightContent(analysis) {
    console.log('开始高亮内容:', analysis);
    
    // 清除现有高亮
    this.clearHighlights();
    
    // 实现视觉层次
    this.applyVisualHierarchy(analysis);
    
    // 高亮关键词
    if (analysis.keywords && analysis.keywords.length > 0) {
      console.log('开始高亮关键词:', analysis.keywords);
      this.highlightKeywords(analysis.keywords);
    } else {
      console.log('未找到关键词，尝试使用keyPoints进行高亮');
      // 如果没有keywords，尝试从 keyPoints 中提取关键词
      const extractedKeywords = this.extractKeywordsFromText(analysis.keyPoints);
      if (extractedKeywords.length > 0) {
        this.highlightKeywords(extractedKeywords);
      }
    }
    
    // 高亮重要章节（如果有sections数据）
    if (analysis.sections && analysis.sections.length > 0) {
      this.highlightSections(analysis.sections);
    }
    
    // 创建浮动面板显示分析结果
    this.createFloatingPanel(analysis);
    
    // 滚动到文章主体位置
    this.scrollToMainContent();
  }

  // 高亮关键词
  highlightKeywords(keywords) {
    if (!keywords || keywords.length === 0) {
      console.log('没有关键词需要高亮');
      return;
    }
    
    console.log('开始高亮关键词:', keywords);
    
    // 按长度排序，先匹配长词组避免冲突
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    // 创建更精确的关键词正则表达式
    const keywordRegexes = sortedKeywords.map(keyword => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // 对于英文词汇，使用词边界
      if (/^[a-zA-Z\s]+$/.test(keyword)) {
        return new RegExp(`\\b(${escaped})\\b`, 'gi');
      } else {
        // 对于中文或混合内容，不使用词边界
        return new RegExp(`(${escaped})`, 'gi');
      }
    });
    
    console.log('关键词正则表达式数量:', keywordRegexes.length);
    
    // 获取所有可能包含文本的元素
    const textElements = this.getTextElements();
    console.log('找到文本元素数量:', textElements.length);
    
    let highlightCount = 0;
    
    textElements.forEach(element => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim() && 
            !node.parentElement.classList.contains('tldr-highlight') &&
            !node.parentElement.closest('.tldr-panel') &&
            !node.parentElement.closest('.tldr-sidebar')) {
          textNodes.push(node);
        }
      }
      
      textNodes.forEach(textNode => {
        let text = textNode.textContent;
        let hasMatch = false;
        
        // 逐个尝试匹配关键词
        keywordRegexes.forEach((regex, index) => {
          if (regex.test(text)) {
            hasMatch = true;
            text = text.replace(regex, '<span class="tldr-highlight">$1</span>');
            console.log(`匹配到关键词: ${sortedKeywords[index]}`);
          }
        });
        
        if (hasMatch) {
          const parent = textNode.parentNode;
          const wrapper = document.createElement('span');
          wrapper.innerHTML = text;
          
          // 为高亮元素添加悬停事件
          const highlights = wrapper.querySelectorAll('.tldr-highlight');
          highlights.forEach(highlight => {
            this.addHoverInteraction(highlight);
          });
          
          // 替换文本节点
          parent.insertBefore(wrapper, textNode);
          parent.removeChild(textNode);
          
          highlightCount++;
        }
      });
    });
    
    console.log('总共高亮了', highlightCount, '个元素');
    
    // 如果没有找到匹配，输出调试信息
    if (highlightCount === 0) {
      console.log('未找到匹配的内容，关键词列表:', sortedKeywords);
      console.log('文本元素样例:', textElements.slice(0, 3).map(el => el.textContent.substring(0, 100)));
    }
  }

  // 创建浮动面板显示分析结果
  createFloatingPanel(analysis) {
    // 先检查是否有侧边栏模式
    const sidebar = document.getElementById('tldr-sidebar');
    if (sidebar) {
      // 如果在侧边栏模式，更新侧边栏内容
      this.updateSidebarContent(analysis);
      return;
    }
    
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
        ${analysis.keywords && analysis.keywords.length > 0 ? `
          <div class="tldr-keywords">
            <h4>关键词</h4>
            <div class="tldr-keyword-tags">
              ${analysis.keywords.map(keyword => `<span class="tldr-keyword-tag">${keyword}</span>`).join('')}
            </div>
          </div>
        ` : ''}
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
    console.log('清除高亮');
    
    // 移除高亮的span标签
    const highlights = document.querySelectorAll('.tldr-highlight');
    console.log('找到', highlights.length, '个高亮元素');
    
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      // 用文本节点替换高亮元素
      const textNode = document.createTextNode(highlight.textContent);
      parent.replaceChild(textNode, highlight);
    });
    
    // 清除视觉层次样式
    const hierarchyElements = document.querySelectorAll('.tldr-low-importance, .tldr-medium-importance, .tldr-high-importance, .tldr-important-section');
    hierarchyElements.forEach(element => {
      element.classList.remove('tldr-low-importance', 'tldr-medium-importance', 'tldr-high-importance', 'tldr-important-section');
      element.style.opacity = '';
      element.style.borderLeft = '';
      element.style.paddingLeft = '';
      element.style.backgroundColor = '';
      element.style.borderRadius = '';
      element.style.padding = '';
      element.style.margin = '';
    });
    
    // 合并相邻的文本节点
    this.mergeAdjacentTextNodes();
    
    // 移除浮动面板
    const panel = document.getElementById('tldr-floating-panel');
    if (panel) {
      panel.remove();
    }
    
    // 移除侧边栏
    const sidebar = document.getElementById('tldr-sidebar');
    if (sidebar) {
      sidebar.remove();
    }
    
    return Promise.resolve();
  }

  // 从文本中提取关键词
  extractKeywordsFromText(textArray) {
    if (!Array.isArray(textArray)) return [];
    
    const keywords = [];
    // 中英文停用词
    const stopWords = new Set([
      // 英文停用词
      'the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'for', 'to', 'of', 'a', 'an',
      'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their',
      'what', 'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      // 中文停用词
      '的', '了', '在', '有', '是', '与', '或', '但是', '可以', '能够', '一个', '这个', '那个',
      '我们', '你们', '他们', '这里', '那里', '因为', '所以', '然后', '而且', '但是'
    ]);
    
    textArray.forEach(text => {
      // 提取中文词汇（至少2个字符）
      const chineseWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
      
      // 提取英文词汇（至少3个字母，包括复合词）
      const englishWords = text.match(/[a-zA-Z]+(?:\s+[a-zA-Z]+){0,2}/g) || [];
      
      // 处理中文词汇
      chineseWords.forEach(word => {
        if (word.length >= 2 && !stopWords.has(word.toLowerCase())) {
          keywords.push(word);
        }
      });
      
      // 处理英文词汇
      englishWords.forEach(phrase => {
        const words = phrase.split(/\s+/);
        
        // 单词和短语都加入
        if (words.length === 1) {
          const word = words[0].toLowerCase();
          if (word.length >= 3 && !stopWords.has(word)) {
            // 保留原始大小写
            keywords.push(phrase.trim());
          }
        } else {
          // 复合词组（如 "Claude Code", "Enterprise plan"）
          const hasStopWords = words.some(w => stopWords.has(w.toLowerCase()));
          if (!hasStopWords && phrase.trim().length >= 4) {
            keywords.push(phrase.trim());
          }
        }
      });
    });
    
    // 去重并按长度排序（长的词组优先）
    const uniqueKeywords = [...new Set(keywords)];
    uniqueKeywords.sort((a, b) => b.length - a.length);
    
    return uniqueKeywords.slice(0, 15); // 返回前15个
  }

  // 获取页面主要文本元素
  getTextElements() {
    // 优先选择文章内容区域
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.post-body',
      '.content-body'
    ];
    
    let contentElements = [];
    
    // 尝试找到文章内容区域
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        contentElements = Array.from(elements);
        console.log('找到文章内容区域:', selector);
        break;
      }
    }
    
    // 如果没有找到特定区域，使用所有p标签
    if (contentElements.length === 0) {
      contentElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));
      console.log('使用默认文本元素');
    }
    
    // 过滤掉导航、页脚等元素
    return contentElements.filter(el => {
      const excludeSelectors = [
        'nav', 'header', 'footer', '.nav', '.navbar', '.header', '.footer',
        '.sidebar', '.menu', '.advertisement', '.ad', '.comment', '.comments'
      ];
      
      return !excludeSelectors.some(selector => {
        return el.matches(selector) || el.closest(selector);
      });
    });
  }

  // 合并相邻的文本节点
  mergeAdjacentTextNodes() {
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
    
    textNodes.forEach(textNode => {
      let nextSibling = textNode.nextSibling;
      while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        textNode.textContent += nextSibling.textContent;
        const nodeToRemove = nextSibling;
        nextSibling = nextSibling.nextSibling;
        nodeToRemove.parentNode.removeChild(nodeToRemove);
      }
    });
  }

  // 应用视觉层次
  applyVisualHierarchy(analysis) {
    console.log('应用视觉层次');
    
    // 获取所有段落元素
    const allParagraphs = this.getTextElements();
    
    // 为每个段落计算重要性分数
    allParagraphs.forEach(element => {
      const importance = this.calculateImportance(element, analysis);
      this.applyImportanceStyle(element, importance);
    });
  }

  // 计算段落重要性
  calculateImportance(element, analysis) {
    const text = element.textContent.trim();
    if (!text) return 0;
    
    let score = 0.3; // 基础分数
    
    // 检查是否包含关键词
    if (analysis.keywords) {
      const keywordCount = analysis.keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      if (keywordCount > 0) {
        score += Math.min(keywordCount * 0.2, 0.4); // 关键词加分，最多0.4
      }
    }
    
    // 检查是否包含关键点内容
    if (analysis.keyPoints) {
      const keyPointMatch = analysis.keyPoints.some(point => {
        return text.includes(point.substring(0, 10)) || point.includes(text.substring(0, 10));
      });
      
      if (keyPointMatch) {
        score += 0.3; // 关键点加分
      }
    }
    
    // 根据段落位置调整分数（前面的段落通常更重要）
    const allElements = this.getTextElements();
    const position = Array.from(allElements).indexOf(element);
    if (position >= 0 && position < allElements.length * 0.3) {
      score += 0.2; // 前30%的内容加分
    }
    
    // 根据段落长度调整
    if (text.length > 200) {
      score += 0.1; // 较长的段落可能更重要
    }
    
    return Math.min(score, 1.0); // 最大值为1.0
  }

  // 应用重要性样式
  applyImportanceStyle(element, importance) {
    // 移除之前的重要性样式
    element.classList.remove('tldr-low-importance', 'tldr-medium-importance', 'tldr-high-importance');
    element.style.opacity = '';
    
    if (importance < 0.4) {
      // 低重要性：降低透明度
      element.classList.add('tldr-low-importance');
      element.style.opacity = '0.6';
    } else if (importance < 0.7) {
      // 中等重要性：保持原样
      element.classList.add('tldr-medium-importance');
      element.style.opacity = '0.8';
    } else {
      // 高重要性：突出显示
      element.classList.add('tldr-high-importance');
      element.style.opacity = '1.0';
      element.style.borderLeft = '3px solid #2196f3';
      element.style.paddingLeft = '8px';
    }
  }

  // 高亮重要章节
  highlightSections(sections) {
    console.log('高亮重要章节:', sections);
    
    sections.forEach(section => {
      if (section.importance && section.importance > 0.7) {
        // 尝试找到对应的DOM元素
        const sectionText = section.text.substring(0, 50); // 取前50个字符作为匹配
        const elements = this.getTextElements();
        
        elements.forEach(element => {
          if (element.textContent.includes(sectionText)) {
            element.classList.add('tldr-important-section');
            element.style.backgroundColor = '#e3f2fd';
            element.style.borderRadius = '4px';
            element.style.padding = '8px';
            element.style.margin = '8px 0';
          }
        });
      }
    });
  }

  // 滚动到主要内容
  scrollToMainContent() {
    const contentContainer = this.findContentContainer();
    if (contentContainer) {
      contentContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // 如果没找到主要内容，滚动到第一个段落
      const firstParagraph = document.querySelector('p');
      if (firstParagraph) {
        firstParagraph.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  }

  // 切换侧边栏模式
  toggleSidebarMode() {
    const existingSidebar = document.getElementById('tldr-sidebar');
    
    if (existingSidebar) {
      // 关闭侧边栏
      existingSidebar.remove();
    } else {
      // 关闭浮动面板并开启侧边栏
      const floatingPanel = document.getElementById('tldr-floating-panel');
      if (floatingPanel) {
        floatingPanel.remove();
      }
      
      this.createSidebar();
    }
  }

  // 创建侧边栏
  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'tldr-sidebar';
    sidebar.className = 'tldr-sidebar';
    
    sidebar.innerHTML = `
      <div class="tldr-sidebar-header">
        <h3>TLDR 分析</h3>
        <div class="tldr-sidebar-controls">
          <button class="tldr-resize-btn" title="调整大小">↔</button>
          <button class="tldr-close-sidebar">&times;</button>
        </div>
      </div>
      <div class="tldr-sidebar-content" id="tldr-sidebar-content">
        <p>请先点击分析按钮获取内容分析...</p>
      </div>
    `;
    
    // 添加到页面
    document.body.appendChild(sidebar);
    
    // 绑定事件
    sidebar.querySelector('.tldr-close-sidebar').addEventListener('click', () => {
      sidebar.remove();
    });
    
    // 使侧边栏可调整大小
    this.makeResizable(sidebar);
    
    return sidebar;
  }

  // 使侧边栏可调整大小
  makeResizable(sidebar) {
    const resizeBtn = sidebar.querySelector('.tldr-resize-btn');
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    
    resizeBtn.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = parseInt(document.defaultView.getComputedStyle(sidebar).width, 10);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    });
    
    function handleMouseMove(e) {
      if (!isResizing) return;
      const width = startWidth - (e.clientX - startX);
      if (width >= 300 && width <= 600) {
        sidebar.style.width = width + 'px';
      }
    }
    
    function handleMouseUp() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

  // 更新侧边栏内容
  updateSidebarContent(analysis) {
    const sidebarContent = document.getElementById('tldr-sidebar-content');
    if (sidebarContent) {
      sidebarContent.innerHTML = `
        <div class="tldr-summary">
          <h4>摘要</h4>
          <p>${analysis.summary}</p>
        </div>
        <div class="tldr-key-points">
          <h4>关键点</h4>
          <ul>
            ${(analysis.keyPoints || []).map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
        ${analysis.keywords && analysis.keywords.length > 0 ? `
          <div class="tldr-keywords">
            <h4>关键词</h4>
            <div class="tldr-keyword-tags">
              ${analysis.keywords.map(keyword => `<span class="tldr-keyword-tag">${keyword}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        <div class="tldr-toggle-controls">
          <button class="tldr-toggle-btn" id="toggleHighlights">切换高亮</button>
          <button class="tldr-toggle-btn" id="toggleHierarchy">切换层次</button>
        </div>
      `;
      
      // 绑定切换按钮事件
      const toggleHighlightsBtn = sidebarContent.querySelector('#toggleHighlights');
      const toggleHierarchyBtn = sidebarContent.querySelector('#toggleHierarchy');
      
      if (toggleHighlightsBtn) {
        toggleHighlightsBtn.addEventListener('click', () => this.toggleHighlights());
      }
      
      if (toggleHierarchyBtn) {
        toggleHierarchyBtn.addEventListener('click', () => this.toggleHierarchy());
      }
    }
  }

  // 添加悬停交互
  addHoverInteraction(element) {
    let originalStyle = null;
    
    element.addEventListener('mouseenter', () => {
      // 保存原始样式
      originalStyle = {
        backgroundColor: element.style.backgroundColor,
        color: element.style.color,
        fontWeight: element.style.fontWeight,
        padding: element.style.padding,
        borderRadius: element.style.borderRadius,
        border: element.style.border
      };
      
      // 显示原始样式（去除高亮）
      element.style.backgroundColor = 'transparent';
      element.style.color = 'inherit';
      element.style.fontWeight = 'normal';
      element.style.padding = '0';
      element.style.borderRadius = '0';
      element.style.border = 'none';
      
      // 添加悬停提示
      element.title = '悬停查看原始样式';
    });
    
    element.addEventListener('mouseleave', () => {
      // 恢复高亮样式
      if (originalStyle) {
        Object.keys(originalStyle).forEach(key => {
          element.style[key] = originalStyle[key];
        });
      }
      element.title = '';
    });
    
    // 添加点击事件（可选）
    element.addEventListener('click', (e) => {
      e.preventDefault();
      this.showKeywordDetail(element.textContent);
    });
  }

  // 显示关键词详情
  showKeywordDetail(keyword) {
    // 创建简单的提示框
    const tooltip = document.createElement('div');
    tooltip.className = 'tldr-keyword-tooltip';
    tooltip.innerHTML = `
      <div class="tldr-tooltip-content">
        <h4>关键词: ${keyword}</h4>
        <p>这是AI分析提取的重要关键词</p>
        <button class="tldr-tooltip-close">关闭</button>
      </div>
    `;
    
    tooltip.querySelector('.tldr-tooltip-close').addEventListener('click', () => {
      tooltip.remove();
    });
    
    document.body.appendChild(tooltip);
    
    // 3秒后自动关闭
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, 3000);
  }

  // 切换高亮显示
  toggleHighlights() {
    const highlights = document.querySelectorAll('.tldr-highlight');
    const isVisible = highlights.length > 0 && highlights[0].style.display !== 'none';
    
    highlights.forEach(highlight => {
      if (isVisible) {
        highlight.style.display = 'none';
      } else {
        highlight.style.display = 'inline';
      }
    });
    
    console.log(isVisible ? '隐藏高亮' : '显示高亮');
  }

  // 切换层次显示
  toggleHierarchy() {
    const hierarchyElements = document.querySelectorAll('.tldr-low-importance, .tldr-medium-importance, .tldr-high-importance');
    
    if (hierarchyElements.length === 0) {
      console.log('没有层次信息可切换');
      return;
    }
    
    const isHierarchyVisible = !hierarchyElements[0].classList.contains('tldr-hierarchy-disabled');
    
    hierarchyElements.forEach(element => {
      if (isHierarchyVisible) {
        // 隐藏层次效果
        element.classList.add('tldr-hierarchy-disabled');
        element.style.opacity = '1';
        element.style.borderLeft = 'none';
        element.style.paddingLeft = '0';
      } else {
        // 显示层次效果
        element.classList.remove('tldr-hierarchy-disabled');
        // 恢复原有样式
        if (element.classList.contains('tldr-low-importance')) {
          element.style.opacity = '0.6';
        } else if (element.classList.contains('tldr-medium-importance')) {
          element.style.opacity = '0.8';
        } else if (element.classList.contains('tldr-high-importance')) {
          element.style.opacity = '1.0';
          element.style.borderLeft = '3px solid #2196f3';
          element.style.paddingLeft = '8px';
        }
      }
    });
    
    console.log(isHierarchyVisible ? '隐藏层次' : '显示层次');
  }
}

// 初始化Content Script
const contentScript = new ContentScript();