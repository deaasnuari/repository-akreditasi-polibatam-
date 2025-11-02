import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Routes
import authRoutes from './routes/authRoutes.js';
import relevansiPenelitianRoutes from "./routes/relevansiPenelitian.js";
import relevansiPendidikanRoutes from "./routes/relevansiPendidikan.js";
import diferensiasiMisiRoutes from './routes/diferensiasiMisi.js';
import budayaMutuRoutes from "./routes/budayaMutu.js";
import ledRoutes from './routes/ledRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewLEDP4MRoutes from "./routes/reviewLEDP4M.js";
import akuntabilitasRoutes from "./routes/akuntabilitas.js";
import matriksPenilaianAkreditasiRoutes from "./routes/matriksPenilaianAkreditasi.js";
import relevansiPkmRoutes from "./routes/relevansiPkm.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1); // kalau deploy pakai proxy (nginx, etc)

// ===== Middleware =====
// Parse JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors({
  origin: 'http://localhost:3000', // alamat frontend Next.js
  credentials: true, // wajib supaya cookie bisa dikirim
}));

// Logger untuk debug
app.use((req, res, next) => {
  console.log(`[backend] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/relevansi-penelitian", relevansiPenelitianRoutes);
app.use("/api/relevansi-pendidikan", relevansiPendidikanRoutes);
app.use('/api/diferensiasi-misi', diferensiasiMisiRoutes);
app.use("/api/relevansi-pkm", relevansiPkmRoutes);
app.use("/api/budaya-mutu", budayaMutuRoutes);
app.use('/api/led', ledRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/p4m/reviewLED", reviewLEDP4MRoutes);
app.use("/api/akuntabilitas", akuntabilitasRoutes);
app.use("/api/matriks-penilaian", matriksPenilaianAkreditasiRoutes);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[backend] Server running on port ${PORT}`));
