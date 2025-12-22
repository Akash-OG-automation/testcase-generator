@echo off
start cmd /k "ollama run llama3:8b"
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
echo App starting... Open http://localhost:5173 in 30 seconds.
pause