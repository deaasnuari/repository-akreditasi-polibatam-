import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/authRoutes.js";
import relevansiPenelitianRoutes from "./routes/relevansiPenelitian.js";
import relevansiPendidikanRoutes from "./routes/relevansiPendidikan.js";
import diferensiasiMisiRoutes from './routes/diferensiasiMisi.js';
import { Pool } from "pg";
import budayaMutuRoutes from "./routes/budayaMutu.js";
import ledRoutes from './routes/ledRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewLEDP4MRoutes from "./routes/reviewLEDP4M.js";


// 🆕 Tambahan untuk Relevansi PKM
import relevansiPkmRoutes from "./routes/relevansiPkm.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS early so all routes receive CORS headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger to help debugging (prints method + url)
app.use((req, res, next) => {
  console.log(`[backend] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 📂 ROUTES 
app.use("/api/relevansi-penelitian", relevansiPenelitianRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/relevansi-pendidikan", relevansiPendidikanRoutes);
app.use('/api/diferensiasi-misi', diferensiasiMisiRoutes);
app.use("/api/relevansi-pkm", relevansiPkmRoutes);
app.use("/api/budaya-mutu", budayaMutuRoutes);
app.use('/api/led', ledRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/p4m/reviewLED", reviewLEDP4MRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
