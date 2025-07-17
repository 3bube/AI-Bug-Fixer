import { Router } from "express";

const router = Router();

import { redirectUser, handleCallback } from "../controllers/github.controller";

// Route to redirect user to GitHub for authentication
router.get("/login", redirectUser);
// Route to handle GitHub callback and exchange code for access token
router.get("/callback", handleCallback);

export default router;
