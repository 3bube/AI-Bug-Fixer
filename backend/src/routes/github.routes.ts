import { Router } from "express";

const router = Router();

import {
  redirectUser,
  handleCallback,
  verifyToken,
  getPullRequests,
  getAllUserPullRequests,
  getPullRequestById,
  approveFix,
} from "../controllers/github.controller";

router.post("/pr/approve-fix", approveFix);

router.get("/pr/:id/:owner/:repo", getPullRequestById);
// Route to redirect user to GitHub for authentication
router.get("/login", redirectUser);
// Route to handle GitHub callback and exchange code for access token
router.get("/callback", handleCallback);

router.get("/verify", verifyToken);

router.get("/prs/user", getAllUserPullRequests);

router.get("/prs/:repoOwner/:repoName", getPullRequests);

export default router;
