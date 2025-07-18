import { Request, Response } from "express";

const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
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
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    const data = await response.json();
    const accessToken = (data as { access_token: string }).access_token;

    res.redirect(`http://localhost:3000/auth/callback?code=${accessToken}`);
  } catch (error) {
    console.error("Error exchanging code for access token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token not provided" });
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Invalid token" });
    }

    const userData = await response.json();
    res.status(200).json({ valid: true, userData });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
