# HOT Web 在麒麟 Linux 服务器上的详细生产部署方案

## 1. 部署目标

本方案用于在麒麟 Linux 服务器 140.32.1.163 上部署 HOT Web。你的现场条件已经明确，因此本文按以下前提编写：

- 系统里已经存在 `/data/www/` 和 `/data/software/`。
- 部署运行用户使用 `baoadmin`。
- PostgreSQL 和 Redis 已经在本机安装并运行。
- 前端和后端项目统一放在 `/data/www/` 下。
- 软件安装包、压缩包、离线文件统一放在 `/data/software/` 下。
- Nginx 负责对外提供静态页面，并反向代理 `/api` 和 `/socket.io`。
- 后端以 systemd 服务常驻运行。

这样做的目标是把外部访问入口统一到 Nginx，后端只负责业务逻辑，数据库和 Redis 直接使用本机服务，降低上线复杂度。

## 2. 部署前先确认的运行事实

在真正执行部署前，先确认这几个事实，避免后面排障时方向错误：

- 前端是 Vue + Vite，最终静态产物在 `frontend/dist`。
- 后端生产启动命令是 `node dist/index.js`。
- 后端默认监听 `0.0.0.0:5001`。
- 健康检查接口是 `GET /api/health`。
- 生产环境应继续使用 `/api` 和 `/socket.io` 这两个路径，不要改路径。
- 当前仓库是 pnpm monorepo，根构建命令是 `pnpm run build`。
- 根构建会依次构建 `packages/shared`、`backend`、`frontend`。

确认这些事实的意义在于：部署方案必须和代码实际行为一致，否则即使 Nginx 和 systemd 都配置成功，页面也可能无法工作。

## 3. 推荐目录结构

建议把整个项目部署到 `/data/www/gt4_web` 下，并把运行时共享文件放到 `shared` 子目录中：

```text
/data/www/
└── gt4_web/
    ├── current -> /data/www/gt4_web/releases/20260706-01
    ├── releases/
    │   ├── 20260706-01/
    │   └── 20260706-02/
    └── shared/
        ├── backend.env
        ├── logs/
        └── run/

/data/software/
└── node-v20.19.0-linux-x64.tar.xz
```

这样规划的原因：

- `releases/` 用来保留每次发布的独立版本，方便回滚。
- `current` 永远指向当前正在运行的版本，升级时只需切换软链接。
- `shared/` 放环境变量、日志和运行文件，升级代码时不覆盖这些内容。
- `/data/software/` 专门放安装包和下载文件，避免把系统盘塞满。

## 4. 先确认当前系统状态

这一步不是为了安装东西，而是为了确认现状。建议先登录服务器后执行下面的检查。

### 4.1 确认用户和目录

```bash
id baoadmin
ls -ld /data/www /data/software
```

为什么要做这一步：

- `id baoadmin` 用来确认部署用户已经存在。
- `ls -ld` 用来确认两个关键目录真的存在，并查看权限是否正常。

### 4.2 确认数据库服务

```bash
systemctl status redis
systemctl status postgresql
```

为什么要做这一步：

- 这能确认 Redis 和 PostgreSQL 是否已经运行。
- 如果服务名和发行版默认名字不同，你可以在这里先发现异常，而不是等程序启动后才看到连接失败。

### 4.3 确认端口是否被占用

```bash
ss -lntp | grep -E ':80|:443|:5001|:6379|:5432' || true
```

为什么要做这一步：

- 80/443 关系到 Nginx 对外提供服务。
- 5001 关系到后端是否已经被其他进程占用。
- 6379 和 5432 关系到 Redis、PostgreSQL 是否在监听。

如果 5001 已经被占用，后面的后端服务就会启动失败，需要先找出占用进程。

## 5. 安装基础软件

如果系统已经装好了这些软件，可以跳过；如果没有，就按下面步骤安装。

### 5.1 安装系统工具

```bash
sudo dnf install -y git curl tar xz nginx
```

为什么这么做：

- `git` 用于拉取代码。
- `curl` 用于下载 Node.js 压缩包。
- `tar` 和 `xz` 用于解压 Node.js 官方包。
- `nginx` 用于提供静态站点和反向代理。

如果系统使用的是 `yum`，就把 `dnf` 换成 `yum`。

### 5.2 可选工具

```bash
sudo dnf install -y lsof net-tools
```

为什么这么做：

- `lsof` 方便排查端口和文件占用。
- `net-tools` 方便使用 `netstat` 等传统网络排查命令。

## 6. 安装 Node.js 20

仓库要求 Node.js 20 或更高版本，因此建议直接使用官方二进制包，不要依赖系统仓库里可能偏旧的版本。

### 6.1 下载 Node.js 压缩包

```bash
cd /data/software
curl -LO https://nodejs.org/dist/v20.19.0/node-v20.19.0-linux-x64.tar.xz
```

为什么这么做：

- 官方包版本明确，和开发环境差异更小。
- 放到 `/data/software/` 符合你的目录规范。

### 6.2 解压并建立固定路径

```bash
tar -xJf /data/software/node-v20.19.0-linux-x64.tar.xz
sudo ln -sfn /data/software/node-v20.19.0-linux-x64 /usr/local/node
sudo ln -sfn /usr/local/node/bin/node /usr/local/bin/node
sudo ln -sfn /usr/local/node/bin/npm /usr/local/bin/npm
sudo ln -sfn /usr/local/node/bin/npx /usr/local/bin/npx
sudo ln -sfn /usr/local/node/bin/corepack /usr/local/bin/corepack
```

为什么这么做：

- 解压后放在 `/data/software/`，方便以后升级版本。
- `/usr/local/node` 作为固定入口，后续升级只要改软链接，不需要改 systemd。
- 把 `node`、`npm`、`npx`、`corepack` 链接到 `/usr/local/bin/`，是为了让所有普通命令都能直接调用。

### 6.3 验证 Node.js

```bash
node -v
npm -v
```

为什么这么做：

- 确认命令真的指向新安装的 Node.js。
- 避免后面 `pnpm` 依赖时才发现 Node 版本不对。

## 7. 安装 pnpm（推荐直接用 npm 全局安装，绕开 Corepack 冲突）

本仓库使用 pnpm workspace，因此 pnpm 版本要尽量和项目声明保持一致。你现场已经出现了 Corepack shim 与 pnpm 冲突（`pnpm -v` 仍触发 Corepack 下载和报错），生产环境建议直接固定到 npm 全局安装的 pnpm，避免再被 Corepack 接管。

### 7.1 先修复 corepack 命令路径

```bash
sudo ln -sfn /usr/local/node/bin/corepack /usr/local/bin/corepack
hash -r
which corepack
corepack -v
```

为什么这么做：

- 你当前 Node.js 安装在 `/usr/local/node`，但 shell 的 PATH 主要找 `/usr/local/bin`。
- 建立软链接后，`corepack` 才能像 `node` 一样直接调用。
- `hash -r` 用于清理 bash 命令缓存，避免继续使用旧路径。

### 7.2 先定位当前 pnpm 实际指向

```bash
which -a pnpm
ls -l /usr/local/bin/pnpm || true
npm prefix -g
```

为什么这么做：

- 你需要先确认 `pnpm` 当前是不是指向了 Corepack 的 shim。
- `npm prefix -g` 能告诉你 npm 全局安装目录，后面要用它来建立正确软链接。

### 7.3 安装并固定 npm 全局 pnpm

```bash
npm install -g pnpm@10.30.3
hash -r
```

为什么这么做：

- 直接安装目标版本，避免 Corepack 在后台下载其他版本（例如 11.x）。
- `hash -r` 用于清理 shell 的命令缓存。

### 7.4 替换掉 Corepack 的 pnpm shim（关键步骤）

```bash
sudo rm -f /usr/local/bin/pnpm /usr/local/bin/pnpx
sudo ln -sfn "$(npm prefix -g)/bin/pnpm" /usr/local/bin/pnpm
sudo ln -sfn "$(npm prefix -g)/bin/pnpx" /usr/local/bin/pnpx
hash -r
which pnpm
pnpm -v
```

为什么这么做：

- 你当前错误的根因是 `pnpm` 命令命中了 Corepack shim，不是 npm 全局安装的 pnpm。
- 删除旧 shim 并重建软链接后，`pnpm` 会稳定走 npm 全局版本。

### 7.5 如果你不再使用 Corepack，可直接禁用

```bash
sudo corepack disable || true
```

为什么这么做：

- 可避免后续误操作再次生成 Corepack shim 覆盖 `pnpm`。
- `|| true` 用于兼容某些环境下 disable 报告“未启用”的情况。

## 8. 创建部署目录

因为你已经有 `/data/www/` 和 `/data/software/`，这里只创建项目需要的子目录。

### 8.1 创建项目目录

```bash
mkdir -p /data/www/gt4_web/releases
mkdir -p /data/www/gt4_web/shared/logs
mkdir -p /data/www/gt4_web/shared/run
```

为什么这么做：

- `releases` 存放每次发布版本。
- `shared/logs` 存放补充日志。
- `shared/run` 可用于 PID 文件或临时运行文件。

### 8.2 创建运行用户

```bash
id baoadmin || useradd --create-home --home-dir /data/www/gt4_web --shell /bin/bash baoadmin
```

为什么这么做：

- 你的部署用户指定为 `baoadmin`，所以后续文件属主和 systemd 都要统一用这个用户。
- 如果用户已经存在，命令会直接返回；如果不存在，就顺手创建。

### 8.3 调整目录权限

```bash
chown -R baoadmin:baoadmin /data/www/gt4_web
chmod 750 /data/www/gt4_web
chmod 750 /data/www/gt4_web/shared
chmod 750 /data/www/gt4_web/shared/logs
chmod 750 /data/www/gt4_web/shared/run
```

为什么这么做：

- 目录属主统一成 `baoadmin`，后续拉代码、安装依赖、写日志都不会因为权限失败。
- 750 能保证属主可读写执行，同时不把目录随意暴露给其他用户。

## 9. 准备代码发布目录

建议每次发布都创建一个独立版本目录，而不是直接在同一目录上反复覆盖。

### 9.1 创建本次发布目录

```bash
export RELEASE_ID=$(date +%Y%m%d-%H%M%S)
mkdir -p /data/www/gt4_web/releases/$RELEASE_ID
cd /data/www/gt4_web/releases/$RELEASE_ID
```

为什么这么做：

- `RELEASE_ID` 用时间戳，天然唯一。
- 独立目录便于回滚和对比问题版本。

### 9.2 获取代码

如果服务器可以直接访问 Git 仓库：

```bash
git clone -b develop <你的仓库地址> .
```

为什么这么做：

- 直接拉取代码最简单。
- 每次发布可以精确对应某个分支或提交。

如果服务器不能直接访问 Git，就把代码包先传到 `/data/software/`，再解压到当前 release 目录。

## 10. 安装项目依赖

### 10.1 进入项目根目录

```bash
cd /data/www/gt4_web/releases/$RELEASE_ID
```

为什么这么做：

- pnpm workspace 的依赖安装必须在仓库根目录执行。
- 这样才能同时处理 `packages/shared`、`backend` 和 `frontend`。

### 10.2 安装依赖

```bash
pnpm install --frozen-lockfile
```

为什么这么做：

- `--frozen-lockfile` 可以保证部署使用 lockfile 中锁定的版本。
- 这能减少“本地能跑、服务器不一致”的问题。

如果这里失败，优先检查三件事：Node.js 版本、pnpm 版本、网络是否能访问依赖源。

## 11. 构建项目

### 11.1 执行构建

```bash
[baoadmin@PKVMGF0509 gt4_web-main]$ cd backend
[baoadmin@PKVMGF0509 backend]$ pnpm prisma generate
cd ..
pnpm run build
```

为什么这么做：

- 这个命令会依次构建共享包、后端和前端。
- 最终得到后端的 `dist` 和前端的 `dist`，这是生产部署的直接输入。

### 11.2 检查构建结果

```bash
ls -la /data/www/gt4_web/releases/$RELEASE_ID/backend/dist
ls -la /data/www/gt4_web/releases/$RELEASE_ID/frontend/dist
```

为什么这么做：

- 如果这两个目录都存在，说明构建结果已经生成。
- 如果目录不存在，就说明构建没有成功完成，不能继续往下走。

## 12. 配置生产环境变量

把后端生产环境变量写到独立文件里，避免把敏感配置放进代码。

### 12.1 创建环境变量文件

```bash
cat > /data/www/gt4_web/shared/backend.env <<'EOF'
NODE_ENV=production
PORT=5001
FRONTEND_ORIGIN=http://140.32.1.163

DATABASE_URL=postgresql://username:password@127.0.0.1:5432/dbname?schema=public

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
EOF
```

为什么这么做：

- `NODE_ENV=production` 会让程序进入生产模式。
- `PORT=5001` 对齐后端默认监听端口。
- `FRONTEND_ORIGIN` 让后端知道前端访问源地址，便于跨域和鉴权逻辑。
- `DATABASE_URL` 指向本机 PostgreSQL。
- `REDIS_HOST/PORT` 指向本机 Redis。

请把 `username`、`password`、`dbname` 、`FRONTEND_ORIGIN`替换成你现场真实值。

### 12.2 设置文件权限

```bash
chown baoadmin:baoadmin /data/www/gt4_web/shared/backend.env
chmod 640 /data/www/gt4_web/shared/backend.env
```

为什么这么做：

- 环境变量文件可能包含数据库口令，所以不建议全员可读。
- 640 可以让运行用户读取，同时避免随意泄露。

## 13. 配置 systemd 后端服务

后端用 systemd 管理，可以确保开机自启、崩溃自动拉起，并且日志统一进 journal。

### 13.1 创建服务文件

```bash
sudo tee > /etc/systemd/system/hot-web-backend.service <<'EOF'
[Unit]
Description=GT4 Web Backend Service
After=network.target redis.service postgresql.service
Wants=network.target

[Service]
Type=simple
User=baoadmin
Group=baoadmin
WorkingDirectory=/data/www/gt4_web/current/backend
EnvironmentFile=/data/www/gt4_web/shared/backend.env
ExecStart=/usr/local/bin/node dist/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

为什么这么做：

- `User=baoadmin` 保证应用以你指定的普通用户运行。
- `WorkingDirectory` 指向后端目录，`dist/index.js` 才能正常找到相对路径资源。
- `EnvironmentFile` 把生产配置和代码分离。
- `Restart=always` 让服务异常退出后自动重启。
- `After=redis.service postgresql.service` 让后端尽量等依赖服务起来后再启动。

如果你现场的 Redis 或 PostgreSQL 服务名不是这两个名字，可以改成实际服务名。

### 13.2 重新加载 systemd

```bash
sudo systemctl daemon-reload
```

为什么这么做：

- systemd 只有在重新加载后才会识别新建的 service 文件。

### 13.3 先不要急着启动

在真正启动前，先把 `current` 软链接指向正确版本，不然 service 会找不到代码。

## 14. 配置 Nginx

Nginx 负责三件事：

- 把前端静态页面直接提供给浏览器。
- 把 `/api` 请求转给 Node.js 后端。
- 把 `/socket.io` WebSocket 连接转给 Node.js 后端。

### 14.1 创建站点配置

```bash
sudo tee /etc/nginx/conf.d/hot-web.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name 140.32.1.163;

    root /data/www/gt4_web/current/frontend/dist;
    index index.html;

    access_log /var/log/nginx/hot-web.access.log;
    error_log /var/log/nginx/hot-web.error.log warn;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
EOF
```

为什么这么做：

- `root` 指向前端构建产物目录，Nginx 才能直接发静态文件。
- `try_files $uri $uri/ /index.html` 解决前端 SPA 刷新 404 问题。
- `/api/` 和 `/socket.io/` 都代理到后端 5001，保持开发期和生产期路径一致。
- WebSocket 连接需要 `Upgrade` 和 `Connection` 头，否则 Socket.IO 可能无法升级连接。

### 14.2 检查 Nginx 配置

```bash
sudo nginx -t
```

为什么这么做：

- 先让 Nginx 做语法检查，避免直接 reload 后整站不可用。

### 14.3 重新加载 Nginx

```bash
sudo systemctl reload nginx
```

为什么这么做：

- reload 比 restart 更平滑。
- 只会加载新配置，不会中断已经建立的连接。

## 15. 切换 current 并启动服务

### 15.1 把 current 指向本次 release

```bash
ln -sfn /data/www/gt4_web/releases/$RELEASE_ID /data/www/gt4_web/current
chown -h baoadmin:baoadmin /data/www/gt4_web/current
```

为什么这么做：

- `current` 是在线版本入口。
- `ln -sfn` 允许你无感切换版本。
- 以后回滚时，只要把软链接改回去即可。

### 15.2 启动后端

```bash
sudo systemctl enable hot-web-backend
sudo systemctl restart hot-web-backend
sudo systemctl status hot-web-backend
```

为什么这么做：

- `enable` 确保服务器重启后后端自动拉起。
- `restart` 让 systemd 读取最新的代码目录和环境变量。
- `status` 用来确认服务是否真的启动成功。

### 15.3 再次重载 Nginx

```bash
nginx -t
systemctl reload nginx
```

为什么这么做：

- 这一步是为了确保 `current` 已经切到正确版本后，Nginx 读取到新的静态目录。

## 16. 首次验证

部署完成后，不要直接对外宣告完成，先做逐项验证。

### 16.1 看服务状态

```bash
sudo systemctl status nginx
sudo systemctl status hot-web-backend
sudo systemctl status redis
sudo systemctl status postgresql
```

为什么这么做：

- 先确认基础服务全都健康。
- 如果某个服务不正常，后面的页面测试没有意义。

### 16.2 看端口监听

```bash
ss -lntp | grep -E ':80|:443|:5001|:6379|:5432'
```

为什么这么做：

- 80 对外提供 HTTP。
- 5001 是后端监听端口。
- 6379 和 5432 是 Redis、PostgreSQL 的本机监听端口。

### 16.3 验证后端健康检查

```bash
curl http://127.0.0.1:5001/api/health
curl http://140.32.1.163/api/health
```

为什么这么做：

- 第一条直接检查后端本体是否正常。
- 第二条检查 Nginx 反向代理是否正常。

如果第二条失败，优先看 Nginx 配置和后端是否真的在 5001 上监听。

### 16.4 验证前端首页

浏览器访问：

```text
http://140.32.1.163/
```

为什么这么做：

- 这一步确认静态资源已经被 Nginx 正确托管。
- 也顺便确认 SPA 路由刷新不会 404。

### 16.5 验证 WebSocket

打开页面后观察实时数据页面，确认 `/socket.io` 连接正常。

为什么这么做：

- 这个项目里实时数据依赖 Socket.IO。
- 即使页面能打开，如果 WebSocket 不通，实时数据功能仍然是坏的。

## 17. 日志和排障

### 17.1 查看后端日志

```bash
journalctl -u hot-web-backend -f
```

为什么这么做：

- 后端问题大多会先体现在这里。
- `-f` 可以实时追踪启动和请求错误。

### 17.2 查看 Nginx 日志

```bash
tail -f /var/log/nginx/hot-web.access.log
tail -f /var/log/nginx/hot-web.error.log
```

为什么这么做：

- access log 用来看请求是否真的到达。
- error log 用来看反向代理、静态文件和配置错误。

### 17.3 常见排障顺序

如果上线后页面或接口异常，建议按这个顺序排：

1. 先看 `systemctl status hot-web-backend`。
2. 再看 `journalctl -u hot-web-backend -n 200`。
3. 再看 `nginx -t`。
4. 再看 Nginx error log。
5. 再看 `curl http://127.0.0.1:5001/api/health`。
6. 最后再看 Redis 和 PostgreSQL 的连通性。

为什么这么做：

- 这是从“最可能出问题的应用层”向“基础设施层”逐步缩小范围。
- 能最快定位是后端挂了、Nginx 配错了，还是数据库连接失败。

### 17.4 检查 Redis 和 PostgreSQL 连通性

```bash
redis-cli -h 127.0.0.1 -p 6379 ping
```

为什么这么做：

- 直接确认 Redis 可用。
- 如果返回 `PONG`，说明 Redis 至少在本机连接层面正常。

```bash
psql -h 127.0.0.1 -U <dbuser> -d <dbname> -c 'select 1;'
```

为什么这么做：

- 直接确认 PostgreSQL 可以登录并执行 SQL。
- 如果这里失败，后端也一定会失败。

## 18. 升级流程

以后每次升级都按同样流程走，保持可重复性。

### 18.1 创建新版本目录

```bash
export RELEASE_ID=$(date +%Y%m%d-%H%M%S)
mkdir -p /data/www/gt4_web/releases/$RELEASE_ID
cd /data/www/gt4_web/releases/$RELEASE_ID
```

为什么这么做：

- 每个版本独立存放，升级不会覆盖旧版本。

### 18.2 拉代码或上传代码

```bash
git clone -b develop <你的仓库地址> .
```

为什么这么做：

- 保证本次发布拿到的是明确版本的代码。

### 18.3 安装和构建

```bash
pnpm install --frozen-lockfile
[baoadmin@PKVMGF0509 gt4_web-main]$ cd backend
[baoadmin@PKVMGF0509 backend]$ pnpm prisma generate
cd ..
pnpm run build
```

为什么这么做：

- 依赖安装和构建都必须在新版本目录里完成，避免污染旧版本。

### 18.4 切换版本并重启

```bash
ln -sfn /data/www/gt4_web/releases/$RELEASE_ID /data/www/gt4_web/current
chown -h baoadmin:baoadmin /data/www/gt4_web/current
sudo systemctl restart hot-web-backend
sudo systemctl reload nginx
```

为什么这么做：

- 软链接切换是最小成本的版本切换方式。
- 重启后端和重载 Nginx 后，新版本才会真正对外提供服务。

## 19. 回滚流程

如果新版本有问题，直接切回旧版本即可。

### 19.1 切回上一版本

```bash
ln -sfn /data/www/gt4_web/releases/<旧版本号> /data/www/gt4_web/current
sudo systemctl restart hot-web-backend
sudo systemctl reload nginx
```

为什么这么做：

- 只改 `current` 的指向，不改旧 release 内容。
- 回滚速度快，风险低。

### 19.2 回滚后立即验证

```bash
curl http://127.0.0.1:5001/api/health
curl http://140.32.1.163/api/health
```

为什么这么做：

- 回滚后也要确认后端和 Nginx 都恢复正常。

## 20. 最终建议

第一版上线建议按下面顺序推进：

1. 先确认 `baoadmin` 用户、`/data/www/`、`/data/software/` 和本机数据库服务都可用。
2. 安装并验证 Node.js 20、pnpm、Nginx。
3. 创建 `/data/www/gt4_web` 目录结构并设置属主为 `baoadmin`。
4. 拉取代码到新的 release 目录，执行 `pnpm install --frozen-lockfile`。
5. 执行 `pnpm run build`，确认 `backend/dist` 和 `frontend/dist` 存在。
6. 写好 `backend.env`、systemd 和 Nginx 配置。
7. 切换 `current`、启动后端、重载 Nginx。
8. 最后用 `/api/health` 和浏览器页面做完整验收。

这样部署的好处是：

- 目录符合你现场的 `/data/www/` 和 `/data/software/` 规范。
- 运行用户统一为 `baoadmin`，权限边界清晰。
- 升级和回滚都只需要切换软链接。
- 后端、Nginx、Redis、PostgreSQL 的责任边界清楚，排障更容易。
