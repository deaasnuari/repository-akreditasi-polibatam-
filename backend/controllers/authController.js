'use client';
export const login = (req, res) => {
  const { email, password, role } = req.body;

  // Data dummy (nanti  ganti pakai DB)
  const users = [
    { email: 'tim@polibatam.com', password: '123456', role: 'tim-akreditasi' },
    { email: 'p4m@polibatam.com', password: '123456', role: 'p4m' },
    { email: 'reviewer@polibatam.com', password: '123456', role: 'reviewer' },
  ];

  const user = users.find(
    (u) => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    return res.status(401).json({ message: 'Email, password, atau role salah' });
  }

  res.json({
    message: 'Login berhasil',
    role: user.role,
  });
};
