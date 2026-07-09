# risk-dashboard

A full-stack risk dashboard scaffold with FastAPI backend and Vite + React + TypeScript + Tailwind frontend.

## Run locally

### Backend

1. Create a Python environment in `backend`.
2. Install dependencies:

```bash
cd backend
python -m pip install -r requirements.txt
```

3. Start the backend:

```bash
uvicorn app.main:app --reload
```

### Frontend

1. Install node dependencies:

```bash
cd frontend
npm install
```

2. Start the frontend:

```bash
npm run dev
```

### Root scripts

From the project root:

```bash
npm run backend
npm run frontend
```

