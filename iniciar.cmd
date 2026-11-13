@echo off
setlocal
pushd "%~dp0"
docker compose up -d --build
if errorlevel 1 (
    popd
    exit /b 1
)
echo.
echo Containers iniciados em segundo plano. Confira o estado abaixo.
docker compose ps
echo.
echo Acesse http://localhost:4200 quando os servicos estiverem prontos.
echo Para consultar as ultimas mensagens: .\ver-logs.cmd
popd
