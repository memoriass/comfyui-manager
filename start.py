#!/usr/bin/env python3
"""
ComfyUI Manager - 一键启动部署脚本
用法:
    python start.py              # 默认启动 (端口 8000) 
    python start.py --port 9000  # 指定端口
    python start.py --skip-build # 跳过前端构建       
    python start.py --force-build # 强制重新构建前端
    python start.py --dev        # 开发模式(热重载)    
"""
import os
import sys
import subprocess
import argparse
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
FRONTEND_DIST = os.path.join(FRONTEND_DIR, "dist")

REQUIRED_MODULES = ["fastapi", "uvicorn", "pydantic", "aiohttp", "websockets"]

# ─── 终端彩色输出 ───
def _c(text: str, code: str) -> str:
    if sys.platform == "win32":
        _ = os.system("")  # 启用 Windows ANSI
    return f"\033[{code}m{text}\033[0m"

def info(msg: str) -> None:  print(_c(f"[√] {msg}", "32"))
def warn(msg: str) -> None:  print(_c(f"[!] {msg}", "33"))
def fail(msg: str) -> None:  print(_c(f"[×] {msg}", "31"))
def step(msg: str) -> None:  print(_c(f"\n>>> {msg}", "36;1"))

BANNER = r"""
  ____                  __       _   _ ___ 
 / ___|___  _ __ ___   / _|_   _| | | |_ _|
| |   / _ \| '_ ` _ \ | |_| | | | | | || | 
| |__| (_) | | | | | ||  _| |_| | |_| || | 
 \____\___/|_| |_| |_||_|  \__, |\___/|___|
                           |___/           
  __  __                                   
 |  \/  | __ _ _ __   __ _  __ _  ___ _ __ 
 | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
 | |  | | (_| | | | | (_| | (_| |  __/ |   
 |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   
                           |___/           
"""

# ─── 检查项 ───

def check_python():
    step("环境检查：Python 版本")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        fail(f"当前 Python 版本为 {version.major}.{version.minor}。")
        fail("请使用 Python 3.10 及以上版本。")
        sys.exit(1)
    info(f"Python 版本: {sys.version.split(' ')[0]} 符合要求。")

def check_pip_deps():
    step("环境检查：Python 依赖库")
    req_file = os.path.join(BACKEND_DIR, "requirements.txt")
    if not os.path.exists(req_file):
        fail(f"未找到 {req_file}，请确保在项目根目录下执行。")
        sys.exit(1)

    missing = []
    for mod in REQUIRED_MODULES:
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)

    if missing:
        warn(f"缺少以下模块: {', '.join(missing)}")
        info("正在使用 pip 安装依赖...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
            info("依赖安装成功！")
        except subprocess.CalledProcessError as e:
            fail(f"安装依赖失败: {e}")
            fail("请尝试手动运行: pip install -r backend/requirements.txt")
            sys.exit(1)
    else:
        info("所有 Python 依赖已满足。")

def check_node():
    step("环境检查：Node.js 与 npm")
    is_win = sys.platform == "win32"
    try:
        node_version = subprocess.run(["node", "-v"], capture_output=True, text=True, shell=is_win)
        if node_version.returncode != 0:
            fail("未检测到 Node.js，请确保已安装 Node.js 并加入环境变量。")
            sys.exit(1)
        info(f"Node.js 版本: {node_version.stdout.strip()}")
    except FileNotFoundError:
        fail("未找到 Node.js 命令，请安装 Node.js。")
        sys.exit(1)

    try:
        npm_version = subprocess.run(["npm", "-v"], capture_output=True, text=True, shell=is_win)
        if npm_version.returncode != 0:
            fail("未检测到 npm，请确认您的 Node.js 安装是否包含 npm。")
            sys.exit(1)
        info(f"npm 版本: {npm_version.stdout.strip()}")
    except FileNotFoundError:
        fail("未找到 npm 命令。")
        sys.exit(1)

# ─── 前端构建 ───

def build_frontend(force: bool = False):
    step("构建前端项目")
    if not os.path.exists(FRONTEND_DIR):
        fail(f"未找到前端目录: {FRONTEND_DIR}")
        sys.exit(1)

    if os.path.exists(FRONTEND_DIST) and not force:
        info("检测到已存在的前端构建文件，跳过构建。")
        info("如需重新构建，请添加 --force-build 参数。")
        return

    info("正在安装前端依赖 (npm install)...")
    try:
        subprocess.check_call(["npm", "install"], cwd=FRONTEND_DIR, shell=True if sys.platform == "win32" else False)
        info("前端依赖安装成功。")
    except subprocess.CalledProcessError:
        fail("前端依赖安装失败。")
        sys.exit(1)

    info("正在构建前端项目 (npm run build)...")
    try:
        subprocess.check_call(["npm", "run", "build"], cwd=FRONTEND_DIR, shell=True if sys.platform == "win32" else False)
        info("前端构建成功！")
    except subprocess.CalledProcessError:
        fail("前端构建失败。")
        sys.exit(1)

# ─── 启动后端 ───

def start_backend(port: int, dev: bool):
    step(f"启动后端服务 (端口: {port})")

    env = os.environ.copy()
    env["PYTHONPATH"] = BASE_DIR
    env["COMFYUI_DATA_DIR"] = os.path.join(BASE_DIR, "data")

    cmd = [
        sys.executable, "-m", "uvicorn", 
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", str(port)
    ]
    if dev:
        cmd.append("--reload")
        info("以开发模式启动，支持热重载。")

    info(f"服务端访问地址：http://localhost:{port}")
    print(_c("-" * 40, "36"))

    try:
        subprocess.run(cmd, env=env)
    except KeyboardInterrupt:
        print("\n" + _c("收到退出信号，正在关闭服务...", "33"))
    finally:
        info("服务已停止。")

# ─── 主函数 ───

def main():
    parser = argparse.ArgumentParser(description="ComfyUI Manager 启动脚本")
    parser.add_argument("--port", type=int, default=8000, help="服务端运行端口 (默认 8000)")
    parser.add_argument("--skip-build", action="store_true", help="跳过前端构建")
    parser.add_argument("--force-build", action="store_true", help="强制重新构建前端")
    parser.add_argument("--dev", action="store_true", help="以开发模式启动后端 (启用热重载)")
    
    args = parser.parse_args()

    print(_c(BANNER, "36;1"))
    print(_c("=" * 60, "34;1"))

    # 1. 环境检查
    check_python()
    check_pip_deps()

    # 2. 前端处理
    if args.skip_build:
        step("前端处理")
        info("用户指定 --skip-build，跳过前端检查和构建。")
    else:
        check_node()
        build_frontend(force=args.force_build)

    # 3. 启动
    start_backend(port=args.port, dev=args.dev)

if __name__ == "__main__":
    main()

