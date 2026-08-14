#!/bin/bash

# 遇到错误时立即退出，确保部署过程安全
set -e

# --- 1. 配置基础变量 ---
BASE_DIR="/data/www/gt4_web"
RELEASES_DIR="${BASE_DIR}/releases"
REPO_URL="https://github.com/coderman197208/gt4_web.git"
BRANCH="develop"

# 生成本次部署的时间戳版本号
RELEASE_ID=$(date +%Y%m%d-%H%M%S)
TARGET_DIR="${RELEASES_DIR}/${RELEASE_ID}"

echo "===> [1/6] 开始部署，版本号: ${RELEASE_ID}"

# --- 2. 创建发布目录并拉取代码 ---
echo "===> [2/6] 创建新版本目录并克隆代码..."
mkdir -p "${TARGET_DIR}"
cd "${TARGET_DIR}"

# 克隆代码（如果代码仓库根路径与日志一致，会自动生成 gt4_web 目录）
git clone -b "${BRANCH}" "${REPO_URL}"
cd gt4_web

# --- 3. 安装依赖与初始化 Prisma ---
echo "===> [3/6] 安装依赖包..."
pnpm install --frozen-lockfile

echo "===> [4/6] 生成 Prisma Client..."
cd backend
pnpm prisma generate
cd ..

# --- 4. 编译打包 ---
echo "===> [5/6] 执行项目 Build 编译..."
pnpm run build

# --- 5. 更新 Current 软链接与重新服务 ---
echo "===> [6/6] 更新软链接并重启/重载服务..."

# 注意：根据日志，克隆出来的实际代码路径在 releases/$RELEASE_ID/gt4_web
ln -sfn "${TARGET_DIR}/gt4_web" "${BASE_DIR}/current"

# 重启后端服务与重载 Nginx
sudo systemctl restart gt4-web-backend
sudo systemctl reload nginx

echo "===> 🎉 部署成功！当前生效版本: ${RELEASE_ID}"