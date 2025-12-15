@echo off
setlocal

REM === Connection strings ===
set LOCAL_DB=postgresql://postgres:Hari%%40123@localhost:5432/schooldb
set REMOTE_DB=postgresql://ksdb_user:vRoeIs7eZgxEdNgmJNXXuR41GTOGWuIk@dpg-d4kq5rre5dus73fd3fjg-a.oregon-postgres.render.com/ksdb



REM === Optional: Add PostgreSQL bin folder to PATH if not already (adjust version/path) ===
REM set PATH=C:\Program Files\PostgreSQL\18\bin;%PATH%

echo ⚠️ Dropping all tables from Render DB...
psql "%REMOTE_DB%" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo 📤 Dumping local database (ignoring owners & privileges)...
pg_dump --no-owner --no-privileges "%LOCAL_DB%" > dump.sql

echo 📥 Restoring into Render database...
psql "%REMOTE_DB%" < dump.sql

echo ✅ Migration completed successfully!

endlocal
pause

"C:\Program Files\PostgreSQL\18\bin"
