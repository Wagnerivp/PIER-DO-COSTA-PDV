import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Persistent state in a local file (will persist until container restarts)
const DB_FILE = path.join(process.cwd(), "app_state.json");

// Default initial state matching the frontend
const DEFAULT_STATE = {
  isRegisterOpen: false,
  registerBalance: 0,
  users: [],
  products: [],
  tables: [],
  orders: [],
  commissionLogs: [],
  expenses: []
};

// Ler estado inicial
let appState: any = null;
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    appState = JSON.parse(data);
  }
} catch (e) {
  console.error("Erro ao ler DB", e);
}

if (!appState) {
  appState = DEFAULT_STATE;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API para ler o estado global
  app.get("/api/state", (req, res) => {
    res.json(appState);
  });

  // API para atualizar o estado global
  app.post("/api/state", (req, res) => {
    const newState = req.body;
    // Vamos fazer um merge superficial para manter tudo seguro
    appState = {
        ...appState,
        ...newState
    };
    
    // Salvar async no disco
    fs.writeFile(DB_FILE, JSON.stringify(appState), (err) => {
        if (err) console.error("Erro salvando DB_FILE:", err);
    });

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
