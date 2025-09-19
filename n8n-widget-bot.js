/**
 * FloatingChatWidget - Lightweight, customizable, dependency-free floating chat widget
 *
 * Main Features:
 * - Responsive design
 * - Smooth animations
 * - Easy customization
 * - No external dependencies
 * - Connects to n8n AI agent API
 *
 * Usage:
 *   <script src="n8n-widget-bot.js"></script>
 *   <script>
 *     FloatingChatWidget.init({ ...options });
 *   </script>
 *
 * @author Dante Labs
 */
(function (window, document) {
  'use strict';

  /**
   * Default configuration for the chat widget
   * @type {Object}
   */
  const DEFAULT_CONFIG = {
    apiUrl: '{{your_n8n_api}}',
    position: 'bottom-right', // 'bottom-left' or 'bottom-right'
    themeColor: '#4C4CBBFF',
    bubbleIcon: '<i class="fas fa-comments"></i>', // FontAwesome chat icon
    title: 'n8n Chatbot',
    placeholder: 'Type your message...',
    welcomeMessage: 'Hello! Type your message...',
    zIndex: 9999,
    width: 350,
    height: 500,
    fontFamily: 'inherit',
    debug: false,
    sessionId: undefined, // Optional, auto-generated if not specified
    animationDuration: 300, // Animation duration (ms)
    typingSpeed: 18, // Typing animation speed (ms)
    maxMessageLength: 1000, // Maximum message length
    resizable: true, // Whether widget is resizable
    minWidth: 300, // Minimum width
    maxWidth: 600, // Maximum width
    minHeight: 400, // Minimum height
    maxHeight: 800, // Maximum height
  };


  /**
   * Utility functions
   */
  const Utils = {
    /**
     * Generate a session ID
     * @returns {string} Unique session ID
     */
    generateSessionId() {
      return 'fcw-' + Math.random().toString(36).slice(2) + Date.now();
    },

    /**
     * Check if a DOM element exists
     * @param {string} id - Element ID
     * @returns {boolean}
     */
    elementExists(id) {
      return document.getElementById(id) !== null;
    },

    /**
     * Safely create an element
     * @param {string} tag - Tag name
     * @param {string} className - Class name
     * @param {string} innerHTML - Inner HTML
     * @returns {HTMLElement}
     */
    createElement(tag, className = '', innerHTML = '') {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (innerHTML) element.innerHTML = innerHTML;
      return element;
    },

    /**
     * Convert markdown to HTML
     * @param {string} text - Markdown text
     * @returns {string} HTML string
     */
    formatMarkdown(text) {
      if (!text) return '';
      
      let html = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.+?)\*/g, '<i>$1</i>')
        .replace(/\- (.+)/g, '<li>$1</li>');
      
      // Wrap li elements with ul
      if (/<li>/.test(html)) {
        html = '<ul>' + html + '</ul>';
      }
      
      return html;
    },

    /**
     * Validate message length
     * @param {string} text - Text to validate
     * @param {number} maxLength - Maximum length
     * @returns {boolean}
     */
    validateMessageLength(text, maxLength) {
      return text && text.length <= maxLength;
    }
  };

  /**
   * Style management class
   */
  const StyleManager = {
    /**
     * Create and inject widget styles
     * @param {Object} config - Configuration object
     */
    createStyles(config) {
      if (Utils.elementExists('floating-chat-widget-style')) return;
      
      const style = Utils.createElement('style', '', this.generateStyleString(config));
      style.id = 'floating-chat-widget-style';
      document.head.appendChild(style);
    },

    /**
     * Generate CSS style string
     * @param {Object} config - Configuration object
     * @returns {string} CSS string
     */
    generateStyleString(config) {
      const position = config.position === 'bottom-left' ? 'left: 24px;' : 'right: 24px;';
      const themeColor = config.themeColor;
      
      return `
        .fcw-bubble {
          position: fixed;
          ${position}
          bottom: 24px;
          z-index: ${config.zIndex};
          background: ${themeColor};
          color: #fff;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
        }
        .fcw-bubble:hover {
          box-shadow: 0 4px 24px rgba(0,0,0,0.25);
          transform: scale(1.05);
          background: ${this.lightenColor(themeColor, 20)};
        }
        .fcw-emoji-bubble,
        .fcw-bubble i {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          width: 24px;
          height: 24px;
          line-height: 1;
          margin: 0;
          padding: 0;
        }
        .fcw-widget {
          position: fixed;
          ${position}
          bottom: 90px;
          z-index: ${config.zIndex};
          width: ${config.width}px;
          max-width: 95vw;
          min-width: ${config.minWidth}px;
          height: ${config.height}px;
          max-height: 80vh;
          min-height: ${config.minHeight}px;
          background: #fff0f6;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(255,105,180,0.10);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transform: translateY(30px) scale(0.98);
          transition: opacity ${config.animationDuration}ms, transform ${config.animationDuration}ms;
          resize: none; /* Disable browser default resize */
        }
        .fcw-widget.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }
        .fcw-header {
          background: ${themeColor};
          color: #fff;
          padding: 16px;
          font-size: 1.1rem;
          font-family: ${config.fontFamily};
          font-weight: bold;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          box-shadow: 0 2px 8px rgba(255,105,180,0.08);
        }
        .fcw-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #fff0f6;
          font-family: ${config.fontFamily};
        }
        .fcw-message {
          margin-bottom: 12px;
          display: flex;
        }
        .fcw-message.user {
          justify-content: flex-end;
        }
        .fcw-message.bot {
          justify-content: flex-start;
        }
        .fcw-bubble-text {
          background: #ffe0ef;
          color: #d72660;
          border-radius: 16px;
          padding: 10px 16px;
          max-width: 80%;
          font-size: 1rem;
          word-break: break-word;
          box-shadow: 0 1px 4px rgba(255,105,180,0.08);
        }
        .fcw-message.user .fcw-bubble-text {
          background: ${themeColor};
          color: #fff;
          box-shadow: 0 2px 8px rgba(255,105,180,0.13);
        }
        .fcw-input-row {
          display: flex;
          border-top: 1px solid #ffd1e6;
          background: #fff0f6;
        }
        .fcw-input {
          flex: 1;
          border: none;
          padding: 12px;
          font-size: 1rem;
          font-family: ${config.fontFamily};
          outline: none;
          background: transparent;
        }
        .fcw-input:focus {
          background: #ffe0ef;
        }
        .fcw-send-btn {
          background: none;
          border: none;
          color: ${themeColor};
          font-size: 1.5rem;
          padding: 0 16px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          border-radius: 50%;
        }
        .fcw-send-btn:hover:not(:disabled) {
          background: #ffb3d6;
          color: #fff;
        }
        .fcw-send-btn:disabled {
          color: #ffc1e3;
          cursor: not-allowed;
        }
        .fcw-loading {
          display: inline-block;
          letter-spacing: 2px;
          animation: fcw-blink 1s infinite steps(1, end);
        }
        @keyframes fcw-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .fcw-error {
          color: #ff4444;
          font-size: 0.9rem;
          margin-top: 5px;
        }
        .fcw-css-bubble-modern {
          display: inline-block;
          width: 22px;
          height: 18px;
          background: #fff;
          border-radius: 12px 12px 16px 16px;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.13);
          vertical-align: middle;
        }
        .fcw-css-bubble-modern::after {
          content: '';
          position: absolute;
          left: 8px;
          bottom: -7px;
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 0 0 8px 8px;
          transform: rotate(18deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        .fcw-resize-handle {
          position: absolute;
          background: rgba(0, 0, 0, 0.1);
          transition: background-color 0.2s;
          z-index: 10;
        }
        .fcw-resize-handle:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        
        /* Corner handles */
        .fcw-resize-nw, .fcw-resize-ne, .fcw-resize-sw, .fcw-resize-se {
          width: 12px;
          height: 12px;
        }
        .fcw-resize-nw {
          top: -6px;
          left: -6px;
          cursor: nw-resize;
        }
        .fcw-resize-ne {
          top: -6px;
          right: -6px;
          cursor: ne-resize;
        }
        .fcw-resize-sw {
          bottom: -6px;
          left: -6px;
          cursor: sw-resize;
        }
        .fcw-resize-se {
          bottom: -6px;
          right: -6px;
          cursor: se-resize;
        }
        
        /* Edge handles */
        .fcw-resize-n, .fcw-resize-s {
          left: 12px;
          right: 12px;
          height: 8px;
        }
        .fcw-resize-n {
          top: -4px;
          cursor: n-resize;
        }
        .fcw-resize-s {
          bottom: -4px;
          cursor: s-resize;
        }
        
        .fcw-resize-e, .fcw-resize-w {
          top: 12px;
          bottom: 12px;
          width: 8px;
        }
        .fcw-resize-e {
          right: -4px;
          cursor: e-resize;
        }
        .fcw-resize-w {
          left: -4px;
          cursor: w-resize;
        }
      `;
    },

    /**
     * Lighten a color
     * @param {string} color - Color code
     * @param {number} percent - Lighten percent
     * @returns {string} Lightened color
     */
    lightenColor(color, percent) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
  };

  /**
   * Message management class
   */
  const MessageManager = {
    /**
     * Add a message
     * @param {HTMLElement} messagesContainer - Message container
     * @param {'user'|'bot'} sender - Sender
     * @param {string} text - Message text
     * @param {Object} options - Options
     */
    addMessage(messagesContainer, sender, text, options = {}) {
      const messageElement = Utils.createElement('div', `fcw-message ${sender}`);
      const bubbleElement = Utils.createElement('div', 'fcw-bubble-text');
      
      if (options.loading) {
        bubbleElement.innerHTML = '<span class="fcw-loading">●●●</span>';
      } else if (options.streaming) {
        bubbleElement.innerHTML = '';
        messageElement.appendChild(bubbleElement);
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom(messagesContainer);
        this.streamTextToBubble(bubbleElement, text);
        return;
      } else {
        bubbleElement.innerHTML = Utils.formatMarkdown(text);
      }
      
      messageElement.appendChild(bubbleElement);
      messagesContainer.appendChild(messageElement);
      this.scrollToBottom(messagesContainer);
    },

    /**
     * Stream text to bubble (typing animation)
     * @param {HTMLElement} bubble - Bubble element
     * @param {string} text - Text to display
     */
    streamTextToBubble(bubble, text) {
      let index = 0;
      const formatted = Utils.formatMarkdown(text);
      const tempDiv = Utils.createElement('div', '', formatted);
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      const typeText = () => {
        if (index <= plainText.length) {
          bubble.textContent = plainText.slice(0, index);
          index++;
          setTimeout(typeText, FloatingChatWidget._config.typingSpeed);
        } else {
          bubble.innerHTML = formatted;
        }
      };
      
      typeText();
    },

    /**
     * Scroll message container to bottom
     * @param {HTMLElement} container - Container element
     */
    scrollToBottom(container) {
      container.scrollTop = container.scrollHeight;
    },

    /**
     * Remove loading message
     * @param {HTMLElement} messagesContainer - Message container
     */
    removeLoadingMessage(messagesContainer) {
      const lastMessage = messagesContainer.lastChild;
      if (lastMessage && lastMessage.querySelector('.fcw-loading')) {
        messagesContainer.removeChild(lastMessage);
      }
    }
  };

  /**
   * Resize management class
   */
  const ResizeManager = {
    isResizing: false,
    resizeDirection: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startRight: 0,
    startTop: 0,
    startBottom: 0,
    resizeHandles: [],

    /**
     * Create resize handles
     * @param {HTMLElement} widget - Widget element
     * @param {Object} config - Configuration object
     */
    createResizeHandles(widget, config) {
      if (!config.resizable) return;

      // Create 8-directional resize handles
      const handles = [
        { direction: 'nw', cursor: 'nw-resize' }, // top-left
        { direction: 'n', cursor: 'n-resize' },   // top
        { direction: 'ne', cursor: 'ne-resize' }, // top-right
        { direction: 'e', cursor: 'e-resize' },   // right
        { direction: 'se', cursor: 'se-resize' }, // bottom-right
        { direction: 's', cursor: 's-resize' },   // bottom
        { direction: 'sw', cursor: 'sw-resize' }, // bottom-left
        { direction: 'w', cursor: 'w-resize' }    // left
      ];

      handles.forEach(handle => {
        const handleElement = Utils.createElement('div', `fcw-resize-handle fcw-resize-${handle.direction}`);
        handleElement.style.cursor = handle.cursor;
        handleElement.dataset.direction = handle.direction;
        widget.appendChild(handleElement);
        this.resizeHandles.push(handleElement);
      });

      // Bind resize events
      this.bindResizeEvents(widget, config);
    },

    /**
     * Bind resize events
     * @param {HTMLElement} widget - Widget element
     * @param {Object} config - Configuration object
     */
    bindResizeEvents(widget, config) {
      this.resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.startResize(e, widget, config, handle.dataset.direction);
        });
      });

      document.addEventListener('mousemove', (e) => {
        if (this.isResizing) {
          this.handleResize(e, widget, config);
        }
      });

      document.addEventListener('mouseup', () => {
        this.stopResize();
      });
    },

    /**
     * Start resizing
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLElement} widget - Widget element
     * @param {Object} config - Configuration object
     * @param {string} direction - Resize direction
     */
    startResize(e, widget, config, direction) {
      this.isResizing = true;
      this.resizeDirection = direction;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startWidth = widget.offsetWidth;
      this.startHeight = widget.offsetHeight;
      
      // Store initial position
      const rect = widget.getBoundingClientRect();
      this.startLeft = rect.left;
      this.startRight = window.innerWidth - rect.right;
      this.startTop = rect.top;
      this.startBottom = window.innerHeight - rect.bottom;

      document.body.style.cursor = this.getCursorForDirection(direction);
      document.body.style.userSelect = 'none';
    },

    /**
     * Handle resizing
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLElement} widget - Widget element
     * @param {Object} config - Configuration object
     */
    handleResize(e, widget, config) {
      if (!this.isResizing) return;

      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      let newWidth = this.startWidth;
      let newHeight = this.startHeight;
      let newLeft = this.startLeft;
      let newRight = this.startRight;

      // Handle resizing by direction
      switch (this.resizeDirection) {
        case 'nw': // top-left
          newWidth = this.startWidth - deltaX;
          newHeight = this.startHeight - deltaY;
          newLeft = this.startLeft + deltaX;
          break;
        case 'n': // top
          newHeight = this.startHeight - deltaY;
          break;
        case 'ne': // top-right
          newWidth = this.startWidth + deltaX;
          newHeight = this.startHeight - deltaY;
          newRight = this.startRight - deltaX;
          break;
        case 'e': // right
          newWidth = this.startWidth + deltaX;
          newRight = this.startRight - deltaX;
          break;
        case 'se': // bottom-right
          newWidth = this.startWidth + deltaX;
          newHeight = this.startHeight + deltaY;
          newRight = this.startRight - deltaX;
          break;
        case 's': // bottom
          newHeight = this.startHeight + deltaY;
          break;
        case 'sw': // bottom-left
          newWidth = this.startWidth - deltaX;
          newHeight = this.startHeight + deltaY;
          newLeft = this.startLeft + deltaX;
          break;
        case 'w': // left
          newWidth = this.startWidth - deltaX;
          newLeft = this.startLeft + deltaX;
          break;
      }

      // Enforce min/max size
      newWidth = Math.max(config.minWidth, Math.min(config.maxWidth, newWidth));
      newHeight = Math.max(config.minHeight, Math.min(config.maxHeight, newHeight));

      // Update widget size
      widget.style.width = newWidth + 'px';
      widget.style.height = newHeight + 'px';

      // Update position
      const position = config.position === 'bottom-left' ? 'left' : 'right';
      if (position === 'right') {
        widget.style.right = newRight + 'px';
      } else {
        widget.style.left = newLeft + 'px';
      }
    },

    /**
     * Get cursor for direction
     * @param {string} direction - Resize direction
     * @returns {string} CSS cursor value
     */
    getCursorForDirection(direction) {
      const cursors = {
        'nw': 'nw-resize',
        'n': 'n-resize',
        'ne': 'ne-resize',
        'e': 'e-resize',
        'se': 'se-resize',
        's': 's-resize',
        'sw': 'sw-resize',
        'w': 'w-resize'
      };
      return cursors[direction] || 'default';
    },

    /**
     * Stop resizing
     */
    stopResize() {
      if (!this.isResizing) return;

      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  /**
   * API management class
   */
  const ApiManager = {
    /**
     * Send message to API
     * @param {string} message - Message to send
     * @param {string} sessionId - Session ID
     * @param {string} apiUrl - API URL
     * @returns {Promise} API response
     */
    async sendMessage(message, sessionId, apiUrl) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionId })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },

    /**
     * Extract reply from API response
     * @param {Object} data - API response data
     * @returns {string} Extracted reply
     */
    extractReply(data) {
      if (data && data.reply) return data.reply;
      if (data && data.output) return data.output;
      if (data && data.message) return data.message;
      return '';
    }
  };

  /**
   * FloatingChatWidget main object
   */
  const FloatingChatWidget = {
    _config: {},
    _elements: {},
    _isOpen: false,
    _onUserRequest: null,

    /**
     * Initialize chat widget
     * @param {Object} config - User configuration options
     */
    init(config = {}) {
      // Wait for DOM if not ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init(config));
        return;
      }
      
      this._config = { ...DEFAULT_CONFIG, ...config };
      
      // Auto-generate session ID if not provided
      if (!this._config.sessionId) {
        this._config.sessionId = Utils.generateSessionId();
      }
      
      try {
        this._createStyles();
        this._createWidget();
        this._bindEvents();
        
        // Show welcome message
        if (this._config.welcomeMessage) {
          MessageManager.addMessage(
            this._elements.messages, 
            'bot', 
            this._config.welcomeMessage
          );
        }
      } catch (error) {
        console.error('[FloatingChatWidget] Initialization error:', error);
      }
    },

    /**
     * Set user request callback
     * @param {function(string):void} callback - Callback function
     */
    onUserRequest(callback) {
      this._onUserRequest = callback;
    },

    /**
     * Programmatically send bot reply
     * @param {string} text - Reply text
     */
    reply(text) {
      if (!Utils.validateMessageLength(text, this._config.maxMessageLength)) {
        return;
      }
      MessageManager.addMessage(this._elements.messages, 'bot', text);
    },

    /**
     * Toggle widget open/close
     */
    toggle() {
      this._toggleWidget();
    },

    /**
     * Open widget
     */
    open() {
      if (!this._isOpen) {
        this._toggleWidget();
      }
    },

    /**
     * Close widget
     */
    close() {
      if (this._isOpen) {
        this._toggleWidget();
      }
    },

    /**
     * Create widget styles (private)
     */
    _createStyles() {
      StyleManager.createStyles(this._config);
    },

    /**
     * Create widget DOM elements (private)
     */
    _createWidget() {
      // Create bubble element
      const bubble = Utils.createElement('div', 'fcw-bubble', this._config.bubbleIcon);
      document.body.appendChild(bubble);
      
      // Create widget element
      const widget = Utils.createElement('div', 'fcw-widget', `
        <div class="fcw-header">${this._config.title}</div>
        <div class="fcw-messages"></div>
        <form class="fcw-input-row" autocomplete="off">
          <input class="fcw-input" type="text" placeholder="${this._config.placeholder}" maxlength="${this._config.maxMessageLength}" />
          <button class="fcw-send-btn" type="submit">➤</button>
        </form>
      `);
      
      document.body.appendChild(widget);
      
      // Store element references
      this._elements = {
        bubble,
        widget,
        messages: widget.querySelector('.fcw-messages'),
        input: widget.querySelector('.fcw-input'),
        form: widget.querySelector('.fcw-input-row'),
        sendBtn: widget.querySelector('.fcw-send-btn'),
      };

      // Create resize handles
      ResizeManager.createResizeHandles(widget, this._config);
    },

    /**
     * Bind DOM events (private)
     */
    _bindEvents() {
      // Bubble click event
      this._elements.bubble.addEventListener('click', () => this._toggleWidget());
      
      // Form submit event
      this._elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleFormSubmit();
      });
      
      // Input field key event
      this._elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this._handleFormSubmit();
        }
      });
    },

    /**
     * Handle form submit (private)
     */
    _handleFormSubmit() {
      const text = this._elements.input.value.trim();
      
      if (!text) return;
      
      // Validate message length
      if (!Utils.validateMessageLength(text, this._config.maxMessageLength)) {
        this._showError('Message is too long.');
        return;
      }
      
      // Add user message
      MessageManager.addMessage(this._elements.messages, 'user', text);
      
      // Clear input field
      this._elements.input.value = '';
      this._elements.input.focus();
      
      // Handle request
      if (typeof this._onUserRequest === 'function') {
        this._onUserRequest(text);
      } else {
        this._sendToApi(text);
      }
    },

    /**
     * Show error message (private)
     * @param {string} message - Error message
     */
    _showError(message) {
      const errorElement = Utils.createElement('div', 'fcw-error', message);
      this._elements.messages.appendChild(errorElement);
      MessageManager.scrollToBottom(this._elements.messages);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        if (errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      }, 3000);
    },

    /**
     * Toggle widget open/close (private)
     */
    _toggleWidget() {
      this._isOpen = !this._isOpen;
      
      if (this._isOpen) {
        this._elements.widget.classList.add('open');
        setTimeout(() => this._elements.input.focus(), this._config.animationDuration + 50);
      } else {
        this._elements.widget.classList.remove('open');
      }
    },

    /**
     * Send message to API (private)
     * @param {string} text - Text to send
     */
    async _sendToApi(text) {
      // Show loading message
      MessageManager.addMessage(this._elements.messages, 'bot', '', { loading: true });
      
      try {
        const data = await ApiManager.sendMessage(
          text, 
          this._config.sessionId, 
          this._config.apiUrl
        );
        
        // Remove loading message
        MessageManager.removeLoadingMessage(this._elements.messages);
        
        const reply = ApiManager.extractReply(data);
        
        if (reply) {
          MessageManager.addMessage(this._elements.messages, 'bot', reply, { streaming: true });
        } else {
          MessageManager.addMessage(this._elements.messages, 'bot', 'Sorry, I did not understand.');
        }
        
      } catch (error) {
        // Remove loading message
        MessageManager.removeLoadingMessage(this._elements.messages);
        
        MessageManager.addMessage(this._elements.messages, 'bot', 'AI agent connection error occurred.');
      }
    }
  };

  // Expose globally
  window.FloatingChatWidget = FloatingChatWidget;
  
})(window, document);