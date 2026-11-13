@echo off
setlocal
pushd "%~dp0"
docker compose logs --tail=100 --no-color
set "result=%errorlevel%"
popd
exit /b %result%
