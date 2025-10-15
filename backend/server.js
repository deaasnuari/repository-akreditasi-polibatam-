import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import budayaMutuRoutes from "./routes/budayaMutu.js";
import authRoutes from "./routes/authRoutes.js";
import relevansiRoutes from "./routes/relevansiPendidikan.js";
import relevansiPenelitianRoutes from "./routes/relevansiPenelitian.js";
import relevansiPendidikanRoutes from "./routes/relevansiPendidikan.js";


// 🆕 Tambahan untuk Relevansi PKM
import relevansiPkmRoutes from "./routes/relevansiPkm.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS early so all routes receive CORS headers
app.use(cors({ origin: "http://localhost:3000" }));

// Simple request logger to help debugging (prints method + url)
app.use((req, res, next) => {
  console.log(`[backend] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 📂 ROUTES 
app.use("/api/relevansi-penelitian", relevansiPenelitianRoutes);
app.use("/api/budaya-mutu", budayaMutuRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/relevansi-pendidikan", relevansiPendidikanRoutes);

// 🆕 Tambahan route untuk PKM
app.use("/api/relevansi-pkm", relevansiPkmRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
