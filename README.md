# nvidia-chat

![GitHub stars](https://img.shields.io/github/stars/NaipanAbdinegara-git/nvidia-chat?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/NaipanAbdinegara-git/nvidia-chat?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/NaipanAbdinegara-git/nvidia-chat?style=for-the-badge&logo=github) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## 📑 Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Key Dependencies](#key-dependencies)
- [Run Commands](#run-commands)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Contributing](#contributing)

## 📝 Description

nvidia-chat is a high-performance, modern communication platform built using Next.js, React, and TypeScript. This web-based application delivers a seamless real-time chat experience, featuring secure user authentication and a robust API backend. Designed for speed and scalability, nvidia-chat leverages the power of its tech stack to provide a type-safe and responsive interface for users worldwide.

## ✨ Features

- 🌐 Api
- 🔐 Auth
- 🕸️ Web

## 🛠️ Tech Stack

- next.js Next.js
- ⚛️ React
- 📜 TypeScript

## ⚡ Quick Start

```bash

# Clone the repository
git clone https://github.com/NaipanAbdinegara-git/nvidia-chat.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Key Dependencies

```
firebase: ^10.14.1
katex: ^0.16.11
lucide-react: ^0.441.0
next: 14.2.5
react: ^18
react-dom: ^18
react-markdown: ^9.0.1
react-syntax-highlighter: ^15.6.1
rehype-katex: ^7.0.1
remark-gfm: ^4.0.0
remark-math: ^6.0.0
uuid: ^10.0.0
```

## 🚀 Run Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **start**: `npm run start`
- **lint**: `npm run lint`

## 📸 Screenshots

> **Tip:** You can auto-generate a beautiful project mockup image using the **Screenshot** button above!

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Main+Application+View" alt="Main Application View" width="80%"/>
</p>

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Feature+Showcase" alt="Feature Showcase" width="80%"/>
</p>

## 📁 Project Structure

```
.
├── app
│   ├── api
│   │   ├── chat
│   │   │   └── route.ts
│   │   └── search
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── ChatApp.tsx
│   ├── ChatInput.tsx
│   ├── ChatWindow.tsx
│   ├── LandingPage.tsx
│   ├── MessageBubble.tsx
│   ├── SettingsModal.tsx
│   ├── Sidebar.tsx
│   ├── ZebraLogo.tsx
│   └── auth
│       ├── AuthScreen.tsx
│       └── UserMenu.tsx
├── lib
│   ├── buildMessages.ts
│   ├── constants.ts
│   ├── fileReader.ts
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── searchUtils.ts
│   ├── storage.ts
│   ├── streaming.ts
│   └── types.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## 🛠️ Development Setup

### Node.js/JavaScript Setup
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` or `yarn install`
3. Start development server: (Check scripts in `package.json`, e.g., `npm run dev`)

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/NaipanAbdinegara-git/nvidia-chat.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.
