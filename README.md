# n8n Widget Bot 🤖

가볍고 사용자 정의 가능한 n8n AI 챗봇 위젯 라이브러리

A lightweight and customizable n8n AI chatbot widget library with zero dependencies.

![Version](https://img.shields.io/npm/v/n8n-widget-bot)
![License](https://img.shields.io/npm/l/n8n-widget-bot)
![Size](https://img.shields.io/bundlephobia/minzip/n8n-widget-bot)

## Features ✨

- 🚀 **Zero Dependencies** - 순수 바닐라 JavaScript로 구현
- 🎨 **Fully Customizable** - 테마, 색상, 위치 등 모든 것을 커스터마이징 가능
- 📱 **Responsive Design** - 모바일과 데스크톱 모두 지원
- 🔄 **Resizable** - 8방향 리사이즈 지원
- ✨ **Smooth Animations** - 부드러운 타이핑 애니메이션
- 🔒 **Session Management** - 자동 세션 관리
- 📝 **Markdown Support** - 기본 마크다운 문법 지원
- 📎 **File Upload** - 파일 첨부 기능 지원 (이미지, PDF, 문서 등)

## Installation 📦

### CDN (추천)

#### jsDelivr CDN
```html
<!-- 최신 버전 -->
<script src="https://cdn.jsdelivr.net/npm/n8n-widget-bot@latest/dist/n8n-widget-bot.min.js"></script>

<!-- 특정 버전 -->
<script src="https://cdn.jsdelivr.net/npm/n8n-widget-bot@1.0.0/dist/n8n-widget-bot.min.js"></script>
```

#### unpkg CDN
```html
<!-- 최신 버전 -->
<script src="https://unpkg.com/n8n-widget-bot@latest/dist/n8n-widget-bot.min.js"></script>

<!-- 특정 버전 -->
<script src="https://unpkg.com/n8n-widget-bot@1.0.0/dist/n8n-widget-bot.min.js"></script>
```

### NPM

```bash
npm install n8n-widget-bot
```

### 직접 다운로드

[GitHub Releases](https://github.com/dantelabs/n8n-widget-bot/releases)에서 최신 버전을 다운로드하세요.

## Quick Start 🚀

### 기본 사용법 (CDN)

```html
<!DOCTYPE html>
<html>
<head>
    <title>n8n Widget Bot Example</title>
</head>
<body>
    <!-- Your content here -->
    
    <!-- n8n Widget Bot -->
    <script src="https://cdn.jsdelivr.net/npm/n8n-widget-bot@latest/dist/n8n-widget-bot.min.js"></script>
    <script>
        FloatingChatWidget.init({
            apiUrl: 'YOUR_N8N_WEBHOOK_URL',
            title: 'AI Assistant',
            themeColor: '#4C4CBB',
            welcomeMessage: 'Hello! How can I help you today?'
        });
    </script>
</body>
</html>
```

### NPM 모듈로 사용

```javascript
// ES6 Module
import 'n8n-widget-bot';

// CommonJS
require('n8n-widget-bot');

// Initialize
window.FloatingChatWidget.init({
    apiUrl: 'YOUR_N8N_WEBHOOK_URL',
    title: 'AI Assistant'
});
```

## Configuration Options ⚙️

```javascript
FloatingChatWidget.init({
    // Required
    apiUrl: 'YOUR_N8N_WEBHOOK_URL',     // n8n webhook URL
    
    // Appearance
    themeColor: '#4C4CBB',               // 주 테마 색상
    position: 'bottom-right',            // 'bottom-left' or 'bottom-right'
    bubbleIcon: '<i class="fas fa-comments"></i>', // 버블 아이콘 (HTML)
    title: 'AI Assistant',               // 위젯 헤더 제목
    
    // Messages
    placeholder: 'Type your message...',  // 입력 필드 플레이스홀더
    welcomeMessage: 'Hello! 👋',         // 환영 메시지
    
    // Dimensions
    width: 350,                          // 초기 너비 (px)
    height: 500,                         // 초기 높이 (px)
    resizable: true,                     // 리사이즈 가능 여부
    minWidth: 300,                       // 최소 너비
    maxWidth: 600,                       // 최대 너비
    minHeight: 400,                      // 최소 높이
    maxHeight: 800,                      // 최대 높이
    
    // Behavior
    animationDuration: 300,              // 애니메이션 지속 시간 (ms)
    typingSpeed: 18,                     // 타이핑 속도 (ms)
    maxMessageLength: 1000,              // 최대 메시지 길이
    
    // File Upload (v1.1.0+)
    enableFileUpload: true,              // 파일 업로드 기능 활성화
    maxFileSize: 10485760,               // 최대 파일 크기 (10MB)
    allowedFileTypes: [                  // 허용된 파일 타입
        'image/*',                       // 모든 이미지
        'application/pdf',               // PDF
        '.doc', '.docx',                 // Word 문서
        '.txt', '.csv', '.xlsx'          // 텍스트 파일
    ],
    
    // Advanced
    sessionId: undefined,                // 세션 ID (자동 생성)
    fontFamily: 'inherit',               // 폰트 패밀리
    zIndex: 9999,                        // z-index
    debug: false                         // 디버그 모드
});
```

## n8n Webhook Setup 🔧

n8n에서 AI 에이전트와 연동하려면:

1. n8n에서 새로운 워크플로우 생성
2. **Webhook** 노드 추가
   - HTTP Method: POST
   - Path: 원하는 경로 설정
   - Response Mode: "When last node finishes"
3. **AI Agent** 노드 추가 및 연결
4. Webhook URL을 복사하여 `apiUrl`에 설정

### Expected API Format

Request (Text only):
```json
{
    "message": "User message",
    "sessionId": "fcw-abc123..."
}
```

Request (With file - v1.1.0+):
```json
{
    "message": "User message",
    "sessionId": "fcw-abc123...",
    "file": {
        "name": "document.pdf",
        "type": "application/pdf",
        "size": 12345,
        "data": "data:application/pdf;base64,..."
    }
}
```

Response (다음 중 하나):
```json
{
    "reply": "Bot response"
}
// or
{
    "output": "Bot response"
}
// or
{
    "message": "Bot response"
}
```

## Advanced Usage 🔥

### Programmatic Control

```javascript
// 위젯 열기
FloatingChatWidget.open();

// 위젯 닫기
FloatingChatWidget.close();

// 토글
FloatingChatWidget.toggle();

// 프로그래밍 방식으로 메시지 전송
FloatingChatWidget.reply('This is a bot message');

// 커스텀 메시지 핸들러
FloatingChatWidget.onUserRequest(function(message) {
    // Custom handling
    console.log('User said:', message);
    
    // Send custom reply
    FloatingChatWidget.reply('Custom response');
});
```

### Multiple Instances

여러 개의 위젯을 사용하려면 각각 다른 설정으로 초기화:

```javascript
// First widget
FloatingChatWidget.init({
    apiUrl: 'URL_1',
    position: 'bottom-right',
    themeColor: '#4C4CBB'
});

// Note: Currently supports only one instance per page
// Multi-instance support coming soon
```

## Examples 📚

### 1. 미니멀 설정
```javascript
FloatingChatWidget.init({
    apiUrl: 'https://your-n8n.com/webhook/chat'
});
```

### 2. 풀 커스터마이징
```javascript
FloatingChatWidget.init({
    apiUrl: 'https://your-n8n.com/webhook/chat',
    themeColor: '#FF6B6B',
    position: 'bottom-left',
    title: '🤖 고객 지원',
    welcomeMessage: '안녕하세요! 무엇을 도와드릴까요?',
    placeholder: '메시지를 입력하세요...',
    width: 400,
    height: 600,
    resizable: false,
    debug: true
});
```

### 3. 다크 테마
```javascript
FloatingChatWidget.init({
    apiUrl: 'https://your-n8n.com/webhook/chat',
    themeColor: '#1a1a1a',
    title: 'Dark Mode Assistant',
    bubbleIcon: '🌙'
});
```

## Browser Support 🌐

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development 🛠️

### Setup
```bash
git clone https://github.com/dantelabs/n8n-widget-bot.git
cd n8n-widget-bot
npm install
```

### Build
```bash
npm run build        # Build both normal and minified versions
npm run dev          # Start development server
```

### File Structure
```
n8n-widget-bot/
├── dist/
│   ├── n8n-widget-bot.js       # Full version
│   └── n8n-widget-bot.min.js   # Minified version
├── examples/
│   └── home.html                # Example implementation
├── n8n-widget-bot.js            # Source file
├── package.json
└── README.md
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

- 🐛 [버그 신고하기](https://github.com/dandacompany/n8n-widget-bot/issues)
- 💡 [기능 요청하기](https://github.com/dandacompany/n8n-widget-bot/issues)
- ▶️ [YouTube 채널](https://www.youtube.com/@dante-labs)  
- 📧 [이메일 문의](mailto:datapod.k@gmail.com)

## Credits 👏

Created with ❤️ by [Dante Labs](https://dante-datalab.com)

---

**Note**: 이 프로젝트는 n8n과 공식적으로 연관되어 있지 않습니다. n8n은 별도의 프로젝트입니다.