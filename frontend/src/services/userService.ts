const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const updateUserProfile = async (formData: FormData) => {
  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'An unknown error occurred');
  }
};
