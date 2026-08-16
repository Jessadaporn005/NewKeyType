@echo off
title CyberDeck OS (Live Update System)
echo ==============================================
echo CYBERDECK OS - LIVE UPDATE MODE INITIATED
echo ==============================================
echo [^>] Establishing connection to latest source...
cd /d "%~dp0"
echo [^>] Running latest version...
npm start
