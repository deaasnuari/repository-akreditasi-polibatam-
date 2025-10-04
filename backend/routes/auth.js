// backend/routes/auth.js
import express from "express";
const router = express.Router();

const users = [
  { email: "tim@polibatam.ac.id", password: "123456", role: "tim-akreditasi" },
  { email: "p4m@polibatam.ac.id", password: "123456", role: "p4m" },
  { email: "reviewer@polibatam.ac.id", password: "123456", role: "reviewer" }
];

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  return res.json({
    message: "Login berhasil",
    role: user.role,
    email: user.email,
  });
});

export default router;
