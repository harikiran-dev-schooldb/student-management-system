@echo off
setlocal

REM =============================
REM PostgreSQL connection strings
REM =============================

set LOCAL_DB=postgresql://postgres:Hari%%40123@localhost:5432/schooldb

set REMOTE_DB=postgresql://neondb_owner:npg_q6wX5yLHiSOM@ep-dark-band-ahyu0exg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

REM =============================
REM PostgreSQL bin path
REM =============================
set PATH=C:\Program Files\PostgreSQL\18\bin;%PATH%

echo ==========================================
echo Dumping local database (schema + data)
echo ==========================================
pg_dump --no-owner --no-privileges --clean --if-exists "%LOCAL_DB%" > dump.sql

echo ==========================================
echo Restoring into Supabase database
echo ==========================================
psql "%REMOTE_DB%" < dump.sql

echo ==========================================
echo Migration completed successfully
echo ==========================================

endlocal
pause
