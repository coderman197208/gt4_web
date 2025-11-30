## 目标概述
*   这是一个工业软件，采用B/S架构和前后端分离技术
*   前端为SPA单页应用，所有页面切换在前端完成，不采用后端渲染SSR
*   前后端数据交互采用两种方式：
    1.  RESTFUL API：用于数据库的CRUD操作
    2.  WebSocket：用于后端向前端推送实时数据和接收前端的输入命令，实时数据从Redis主题订阅获取

## 技术栈
*   后端：Node.js + TypeScript + Fastify + Socket.IO + Prisma
*   前端：Vue.js + TypeScript + Vite + Vue Router + Pinia + axios + shadcn-vue + Tailwind css
*   数据库：PostgreSQL + Redis
*   数据模拟：使用mock-redis-server在开发时模拟Redis的功能，使用JSON Server模拟数据库CRUD操作