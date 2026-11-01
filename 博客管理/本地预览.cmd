@echo off
chcp 65001 >nul
cd /d "%~dp0.."
call npm run build
if errorlevel 1 goto failed
echo 请保持此窗口打开；关闭窗口即可停止预览。
node scripts/serve.mjs --dist --open
:failed
pause
