import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';

export const getAllProdi = async (req, res) => {
  try {
    const prodi = await prisma.users.findMany({
      where: {
        prodi: {
          not: null,
        },
      },
      distinct: ['prodi'],
      select: {
        prodi: true,
      },
    });
    res.json({ success: true, data: prodi.map(p => p.prodi) });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { id } = req.user;
  const { username, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    const updateData = {};

    if (username) {
      updateData.username = username;
    }

    if (req.file) {
      updateData.photo = req.file.path.replace(/\\/g, "/");
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, msg: 'Current password is required to set a new password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, msg: 'Invalid current password' });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        nama_lengkap: true,
        prodi: true,
        role: true,
        photo: true,
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Server error', error: error.message });
  }
};
