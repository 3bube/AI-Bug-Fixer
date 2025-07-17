import { Request, Response } from "express";
import axios from "axios";

const REDIRECT_URI = "http://localhost:5000/github/callback";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export const redirectUser = (req: Request, res: Response) => {
  try {
    const redirect = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo`;
    res.redirect(redirect);
  } catch (error) {
    console.error("Error redirecting user to GitHub:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Code not provided" });
  }

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = response.data.access_token;

    res.redirect(`/dashboard?token=${accessToken}`);
  } catch (error) {
    console.error("Error exchanging code for access token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
