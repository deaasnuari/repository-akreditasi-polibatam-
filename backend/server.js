import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import budayaMutuRoutes from "./routes/budayaMutu.js";
import authRoutes from "./routes/auth.js";
import relevansiRoutes from "./routes/relevansiPendidikan.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:3000" }));


// 📂 ROUTES 
app.use("/api/budaya-mutu", budayaMutuRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/relevansi-pendidikan", relevansiRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
