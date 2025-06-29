@echo off
title FluxAsync - Connexion Supabase PostgreSQL
echo ========================================
echo   CONNEXION SUPABASE FLUXASYNC
echo ========================================
echo Connexion en cours...
echo.

psql -h aws-0-eu-west-2.pooler.supabase.com -p 5432 -d postgres -U postgres.wimxjmhmqqfhbmlpyymd

pause