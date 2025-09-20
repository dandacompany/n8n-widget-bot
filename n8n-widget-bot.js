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
    enableFileUpload: true, // Enable file upload feature
    maxFileSize: 10 * 1024 * 1024, // Maximum file size in bytes (10MB)
    allowedFileTypes: ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx'], // Allowed file types
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
    },

    /**
     * Convert file to base64
     * @param {File} file - File to convert
     * @returns {Promise<string>} Base64 string
     */
    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Validate file
     * @param {File} file - File to validate
     * @param {Object} config - Configuration object
     * @returns {Object} Validation result
     */
    validateFile(file, config) {
      // Check file size
      if (file.size > config.maxFileSize) {
        return {
          valid: false,
          error: `File size exceeds maximum limit of ${this.formatFileSize(config.maxFileSize)}`
        };
      }

      // Check file type
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      let isAllowed = false;

      for (const allowedType of config.allowedFileTypes) {
        if (allowedType.startsWith('.')) {
          // Check file extension
          if (fileName.endsWith(allowedType)) {
            isAllowed = true;
            break;
          }
        } else if (allowedType.endsWith('/*')) {
          // Check MIME type prefix
          const prefix = allowedType.slice(0, -2);
          if (fileType.startsWith(prefix)) {
            isAllowed = true;
            break;
          }
        } else if (fileType === allowedType) {
          // Exact MIME type match
          isAllowed = true;
          break;
        }
      }

      if (!isAllowed) {
        return {
          valid: false,
          error: 'File type not allowed'
        };
      }

      return { valid: true };
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
        .fcw-file-btn {
          background: none;
          border: none;
          color: ${themeColor};
          font-size: 1.3rem;
          padding: 0 12px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          border-radius: 50%;
          position: relative;
        }
        .fcw-file-btn:hover:not(:disabled) {
          background: #ffb3d6;
          color: #fff;
        }
        .fcw-file-btn:disabled {
          color: #ffc1e3;
          cursor: not-allowed;
        }
        .fcw-file-input {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
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
        .fcw-file-preview {
          background: #ffe0ef;
          color: #d72660;
          padding: 8px;
          margin: 8px;
          border-radius: 8px;
          font-size: 0.9rem;
          max-height: 120px;
          overflow-y: auto;
        }
        .fcw-files-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .fcw-file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
        }
        .fcw-file-item:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        .fcw-file-info {
          flex: 1;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .fcw-file-info span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fcw-file-remove {
          background: none;
          border: none;
          color: #d72660;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0 4px;
          margin-left: 8px;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .fcw-file-remove:hover {
          color: #ff4444;
        }
        .fcw-message.user.file {
          flex-direction: column;
          align-items: flex-end;
        }
        .fcw-file-message {
          background: ${themeColor};
          color: #fff;
          border-radius: 16px;
          padding: 10px 16px;
          margin-bottom: 8px;
          max-width: 80%;
          font-size: 0.9rem;
          box-shadow: 0 2px 8px rgba(255,105,180,0.13);
        }
        .fcw-file-icon {
          margin-right: 8px;
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
      const fileButton = this._config.enableFileUpload ? 
        `<button class="fcw-file-btn" type="button" title="Attach files">
          <span>📎</span>
          <input type="file" class="fcw-file-input" accept="${this._config.allowedFileTypes.join(',')}" multiple />
        </button>` : '';

      const widget = Utils.createElement('div', 'fcw-widget', `
        <div class="fcw-header">${this._config.title}</div>
        <div class="fcw-messages"></div>
        <div class="fcw-file-preview" style="display: none;"></div>
        <form class="fcw-input-row" autocomplete="off">
          <input class="fcw-input" type="text" placeholder="${this._config.placeholder}" maxlength="${this._config.maxMessageLength}" />
          ${fileButton}
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
        fileBtn: widget.querySelector('.fcw-file-btn'),
        fileInput: widget.querySelector('.fcw-file-input'),
        filePreview: widget.querySelector('.fcw-file-preview'),
      };

      // Initialize file attachments state (now supports multiple files)
      this._attachedFiles = [];

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

      // File upload events (if enabled)
      if (this._config.enableFileUpload && this._elements.fileInput) {
        this._elements.fileInput.addEventListener('change', (e) => {
          this._handleFileSelect(e);
        });
      }
    },

    /**
     * Handle file selection (private) - supports multiple files
     * @param {Event} e - File input change event
     */
    _handleFileSelect(e) {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Clear previous files
      this._attachedFiles = [];
      
      // Validate and add each file
      for (const file of files) {
        const validation = Utils.validateFile(file, this._config);
        if (!validation.valid) {
          this._showError(`${file.name}: ${validation.error}`);
          continue;
        }
        this._attachedFiles.push(file);
      }
      
      // Clear input if no valid files
      if (this._attachedFiles.length === 0) {
        e.target.value = '';
        return;
      }
      
      // Show preview for all valid files
      this._showFilePreview(this._attachedFiles);
    },

    /**
     * Show file preview (private) - supports multiple files
     * @param {Array<File>} files - Files to preview
     */
    _showFilePreview(files) {
      const preview = this._elements.filePreview;
      
      // Create preview HTML for all files
      let previewHTML = '<div class="fcw-files-container">';
      files.forEach((file, index) => {
        previewHTML += `
          <div class="fcw-file-item" data-index="${index}">
            <div class="fcw-file-info">
              <span class="fcw-file-icon">📄</span>
              <span>${file.name} (${Utils.formatFileSize(file.size)})</span>
            </div>
            <button class="fcw-file-remove" data-index="${index}" type="button">✕</button>
          </div>
        `;
      });
      previewHTML += '</div>';
      
      preview.innerHTML = previewHTML;
      preview.style.display = 'block';

      // Bind remove events for each file
      const removeButtons = preview.querySelectorAll('.fcw-file-remove');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this._removeAttachedFile(index);
        });
      });
    },

    /**
     * Remove attached file (private)
     * @param {number} index - Index of file to remove (if not provided, removes all)
     */
    _removeAttachedFile(index = null) {
      if (index !== null) {
        // Remove specific file
        this._attachedFiles.splice(index, 1);
        
        // Update preview or hide if no files left
        if (this._attachedFiles.length > 0) {
          this._showFilePreview(this._attachedFiles);
        } else {
          this._elements.filePreview.style.display = 'none';
          if (this._elements.fileInput) {
            this._elements.fileInput.value = '';
          }
        }
      } else {
        // Remove all files
        this._attachedFiles = [];
        this._elements.filePreview.style.display = 'none';
        if (this._elements.fileInput) {
          this._elements.fileInput.value = '';
        }
      }
    },

    /**
     * Handle form submit (private) - supports multiple files
     */
    async _handleFormSubmit() {
      const text = this._elements.input.value.trim();
      const hasFiles = this._attachedFiles.length > 0;
      
      if (!text && !hasFiles) return;
      
      // Validate message length
      if (text && !Utils.validateMessageLength(text, this._config.maxMessageLength)) {
        this._showError('Message is too long.');
        return;
      }
      
      // Process files with base64 encoding
      let processedFiles = [];
      if (hasFiles) {
        try {
          for (const file of this._attachedFiles) {
            const base64Data = await Utils.fileToBase64(file);
            const mimeType = file.type || 'application/octet-stream';
            const fileExtension = file.name.split('.').pop() || '';
            const fileType = mimeType.split('/')[0] || 'application';
            
            processedFiles.push({
              fileName: file.name,
              fileSize: `${file.size} bytes`,
              fileExtension: fileExtension,
              fileType: fileType,
              mimeType: mimeType,
              data: base64Data  // Include base64 data
            });

            // Show file message in chat
            this._addFileMessage('user', file.name, Utils.formatFileSize(file.size));
          }
        } catch (error) {
          this._showError('Failed to process files');
          return;
        }
      }

      // Add user message if there's text
      if (text) {
        MessageManager.addMessage(this._elements.messages, 'user', text);
      }
      
      // Clear input and files
      this._elements.input.value = '';
      this._elements.input.focus();
      this._removeAttachedFile();
      
      // Prepare data in n8n webhook format
      const webhookData = {
        sessionId: this._config.sessionId,
        action: 'sendMessage',
        chatInput: text || '',
        files: processedFiles
      };
      
      // Handle request
      if (typeof this._onUserRequest === 'function') {
        this._onUserRequest(webhookData);
      } else {
        this._sendToApi(webhookData);
      }
    },

    /**
     * Add file message to chat (private)
     * @param {string} sender - Sender type ('user' or 'bot')
     * @param {string} fileName - Name of the file
     * @param {string} fileSize - Size of the file
     */
    _addFileMessage(sender, fileName, fileSize) {
      const messageElement = Utils.createElement('div', `fcw-message ${sender} file`);
      const fileMessage = Utils.createElement('div', 'fcw-file-message', 
        `<span class="fcw-file-icon">📎</span> ${fileName} (${fileSize})`);
      messageElement.appendChild(fileMessage);
      this._elements.messages.appendChild(messageElement);
      MessageManager.scrollToBottom(this._elements.messages);
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
     * @param {Object} webhookData - Data in n8n webhook format
     */
    async _sendToApi(webhookData) {
      // The webhookData is already in the correct format:
      // { sessionId, action, chatInput, files }
      
      // Show loading message
      MessageManager.addMessage(this._elements.messages, 'bot', '', { loading: true });
      
      try {
        const response = await fetch(this._config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
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