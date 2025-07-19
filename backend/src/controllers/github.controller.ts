import { Request, Response } from "express";
import { GithubService } from "../services/github.services";

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

  console.log("Received code:", code);

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
          // redirect_uri: REDIRECT_URI,
        }),
      }
    );

    console.log("Response status:", response);

    const data = await response.json();

    console.log("Access token response:", data);

    if (!data.access_token) {
      console.error("No access token received:", data);
      return res
        .status(400)
        .json({ error: "Failed to get access token", details: data });
    }

    const accessToken = data.access_token;

    console.log("Access token:", accessToken);

    // Redirect with token parameter instead of code
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendURL}/auth/callback?token=${accessToken}`);
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

export const getAllUserPullRequests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const per_page = parseInt(req.query.per_page as string) || 10;

    const githubService = new GithubService(
      req.headers.authorization as string
    );

    const { pullRequests, total, hasNextPage } =
      await githubService.getAllUserPullRequests(page, per_page);

    // Return pagination metadata along with the results
    res.status(200).json({
      data: pullRequests,
      pagination: {
        currentPage: page,
        perPage: per_page,
        total,
        totalPages: Math.ceil(total / per_page),
        hasNextPage,
      },
    });
  } catch (error) {
    console.error("Error fetching user pull requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPullRequestById = async (req: Request, res: Response) => {
  const prId = parseInt(req.params.id);
  const { owner, repo } = req.params;

  if (isNaN(prId)) {
    return res.status(400).json({ error: "Invalid pull request ID" });
  }

  if (!owner || !repo) {
    return res
      .status(400)
      .json({ error: "Repository owner and name are required" });
  }

  try {
    const githubService = new GithubService(
      req.headers.authorization as string
    );
    const pullRequest = await githubService.getPullRequest(owner, repo, prId);
    res.status(200).json(pullRequest);
  } catch (error) {
    console.error("Error fetching pull request:", error);
    res.status(500).json({ error: "Inte  rnal Server Error" });
  }
};

export const getPullRequests = async (req: Request, res: Response) => {
  const { repoOwner, repoName } = req.params;

  if (!repoOwner || !repoName) {
    return res
      .status(400)
      .json({ error: "Repository owner and name are required" });
  }

  try {
    const githubService = new GithubService(
      req.headers.authorization as string
    );
    const pullRequests = await githubService.getPullRequests(
      repoOwner,
      repoName
    );
    res.status(200).json(pullRequests);
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveFix = async (req: Request, res: Response) => {
  const { owner, repo, filePath, newContent, pullNumber } = req.body;

  if (!owner || !repo || !filePath || !newContent || !pullNumber) {
    return res
      .status(400)
      .json({
        error:
          "Missing required parameters: owner, repo, filePath, newContent, pullNumber",
      });
  }

  try {
    // Extract token from Authorization header (remove 'Bearer ' prefix)
    const authHeader = req.headers.authorization as string;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    // First, verify token has required permissions
    try {
      const tokenCheck = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/json",
        },
      });

      if (!tokenCheck.ok) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Check if we can access the specific repository
      const repoCheck = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!repoCheck.ok) {
        return res.status(403).json({
          error: "Insufficient permissions to access repository",
          details: `Cannot access ${owner}/${repo}. Please ensure the OAuth app has access to this repository and the token has 'repo' scope.`,
        });
      }
    } catch (permError) {
      console.error("Permission check failed:", permError);
      return res.status(403).json({
        error: "Permission verification failed",
        details: "Please re-authenticate to ensure proper repository access.",
      });
    }

    const githubService = new GithubService(token);
    const result = await githubService.applyCodeFix(
      owner,
      repo,
      filePath,
      newContent,
      pullNumber
    );

    if (result) {
      res.status(200).json({ message: "Fix approved successfully" });
    } else {
      res.status(400).json({ error: "Failed to approve fix" });
    }
  } catch (error) {
    console.error("Error approving fix:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
