import axios from "axios";

export const login = async () => {
  try {
    const response = await axios.get(`${process.env.BACKEND_URL}/github/login`);
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const callback = async (code: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/callback`,
      {
        params: { code },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Callback failed:", error);
    throw error;
  }
};

export const verifyToken = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/verify`,
      {
        params: { token },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};
