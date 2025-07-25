import { Octokit } from "@octokit/rest";
import { PrismaClient } from "../generated/prisma";
import groq from "../utils/grop";

const prisma = new PrismaClient();

export class GithubService {
  private octokit: Octokit;
  private groq = groq;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
    this.groq = groq;
  }

  async getPullRequests(repoOwner: string, repoName: string) {
    try {
      const response = await this.octokit.pulls.list({
        owner: repoOwner,
        repo: repoName,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      throw error;
    }
  }

  async getAllUserPullRequests(page: number = 1, per_page: number = 5) {
    try {
      // Get the authenticated user's username
      const { data: user } = await this.octokit.users.getAuthenticated();
      const username = user.login;

      // Search for PRs with pagination
      const response = await this.octokit.request("GET /search/issues", {
        q: `is:pr author:${username}`,
        page,
        per_page,
        sort: "created",
        order: "desc",
      });

      // Process each PR in the current page
      const enrichedPRs = await Promise.all(
        response.data.items.map(async (searchPr) => {
          try {
            // Get repo info from repository_url
            const [owner, repo] = searchPr.repository_url
              .split("/repos/")[1]
              .split("/");

            // Get the full PR details
            const { data: fullPr } = await this.octokit.pulls.get({
              owner,
              repo,
              pull_number: searchPr.number,
              headers: {
                accept: "application/vnd.github.v3.full+json",
              },
            });

            // Return PR data
            return {
              ...fullPr,
              repository: `${owner}/${repo}`,
            };
          } catch (error) {
            console.error(`Error processing PR ${searchPr.number}:`, error);
            return searchPr;
          }
        })
      );

      // Return paginated results with metadata
      return {
        pullRequests: enrichedPRs,
        total: response.data.total_count,
        hasNextPage: page * per_page < response.data.total_count,
      };
    } catch (error) {
      console.error("Error fetching user pull requests:", error);
      throw error;
    }
  }

  async applyCodeFix(
    owner: string,
    repo: string,
    filePath: string,
    newContent: string,
    pullNumber?: number
  ) {
    try {
      const { execSync } = require("child_process");
      const fs = require("fs");
      const path = require("path");
      const os = require("os");

      // If no pull number provided, we need to find it or create a branch
      if (!pullNumber) {
        throw new Error("Pull request number is required for this fix method");
      }

      // Get pull request details
      const { data: pullRequest } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      const branchName = pullRequest.head.ref;
      const forkRepo = pullRequest.head.repo.full_name;
      const tempDir = path.join(os.tmpdir(), `fix-${Date.now()}`);

      // Create temporary directory using Node.js fs
      fs.mkdirSync(tempDir, { recursive: true });
      const originalCwd = process.cwd();

      try {
        // Change to temp directory
        process.chdir(tempDir);

        // Clone the forked repository
        console.log(`Cloning repository: ${forkRepo}`);
        execSync(`git clone https://github.com/${forkRepo}.git`, {
          stdio: "inherit",
        });

        const repoDir = path.join(tempDir, forkRepo.split("/")[1]);
        process.chdir(repoDir);

        // Check out the pull request branch
        console.log(`Checking out branch: ${branchName}`);
        execSync(`git checkout ${branchName}`, { stdio: "inherit" });

        // Write the new content to the file
        const fullFilePath = path.join(repoDir, filePath);
        console.log(`Writing fix to: ${fullFilePath}`);

        // Ensure directory exists using Node.js fs instead of shell command
        const fileDir = path.dirname(fullFilePath);
        fs.mkdirSync(fileDir, { recursive: true });

        // Write the new content
        fs.writeFileSync(fullFilePath, newContent, "utf8");

        // Commit and push changes
        execSync("git add .", { stdio: "inherit" });
        execSync(`git commit -m "Apply suggested fix to ${filePath}"`, {
          stdio: "inherit",
        });
        execSync(`git push origin ${branchName}`, { stdio: "inherit" });

        console.log(
          `Successfully applied fix to ${filePath} and pushed to ${branchName}`
        );
        return true;
      } finally {
        // Always return to original directory and clean up
        process.chdir(originalCwd);
        try {
          // Use Node.js fs to remove directory instead of shell command
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.warn("Failed to cleanup temp directory:", tempDir);
        }
      }
    } catch (error: any) {
      console.error(`Failed to apply fix to ${filePath}:`, error);

      if (error.message.includes("Permission denied")) {
        throw new Error(
          `Git permission denied. Please ensure you have push access to the repository.`
        );
      } else if (error.message.includes("not found")) {
        throw new Error(
          `Repository or branch not found. Please check the pull request details.`
        );
      } else if (error.message.includes("Authentication failed")) {
        throw new Error(
          `Git authentication failed. Please ensure your credentials are correct.`
        );
      }

      throw error;
    }
  }

  // get pr by id and analyze it
  async getPullRequest(owner: string, repo: string, prId: number) {
    try {
      // Get the full PR details
      const { data: pullRequest } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prId,
        headers: {
          accept: "application/vnd.github.v3.full+json",
        },
      });

      // Get the diff
      const diff = await this.getPRDiff(pullRequest);

      // Get AI analysis
      const analysisResult = await this.analyzePr({
        ...pullRequest,
        diff,
      });

      // Return enriched PR data
      return {
        ...pullRequest,
        diff,
        analysis: analysisResult,
        repository: `${owner}/${repo}`,
      };
    } catch (error) {
      console.error("Error fetching and analyzing pull request:", error);
      throw error;
    }
  }

  // helper method to get PR diff
  async getPRDiff(pr: any): Promise<string> {
    try {
      // Handle both full PR objects and search results
      const diffUrl = pr.diff_url || pr.pull_request?.diff_url;

      if (!diffUrl) {
        throw new Error("No diff URL available for this PR");
      }

      console.log("Fetching diff from:", diffUrl);

      const response = await fetch(diffUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch diff: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Error fetching PR diff:", error);
      throw error;
    }
  }

  // helper method to process and summarize diff
  private processDiff(diff: string): string {
    if (!diff) return "No diff available";

    // Split diff into file sections
    const files = diff.split("diff --git");

    // Process only first 3 files if there are many changes
    const processedFiles = files.slice(0, 4).map((file) => {
      // Get only the first 10 lines of changes per file
      const lines = file.split("\n").slice(0, 10);
      return lines.join("\n");
    });

    return processedFiles.join("\n\n[...truncated...]\n\n");
  }

  // helper metthod to analyze PRs using Groq
  async analyzePr(pr: any) {
    try {
      // Process and truncate the diff
      const processedDiff = this.processDiff(pr.diff);

      const prompt = `Analyze this Pull Request briefly. Return your response in this exact JSON format:
        {
          "analysis": {
            "summary": "1-2 sentence overview",
            "improvements": ["max 2 key improvements"],
            "bestPractices": ["max 2 best practices"],
            "reviewers": ["max 2 reviewer types"]
          },
          "suggestions": {
            "codeFixes": [
              {
                "file": "file path",
                "description": "brief description",
                "suggestedCode": "short fix"
              }
            ],
            "generalSuggestions": ["max 2 suggestions"]
          }
        }

        PR Details:
        Title: ${pr.title}
        Description: ${(pr.body || "No description provided").slice(0, 500)}
        Changes: ${processedDiff}
        
        Keep everything very brief and focused on the most important points only.`;

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more focused responses
        max_tokens: 1000, // Limit response length
      });

      // Parse the response as JSON
      try {
        let content =
          completion.choices[0]?.message?.content ||
          '{"analysis":{"summary":"No response from AI","improvements":[],"bestPractices":[],"reviewers":[]},"suggestions":{"codeFixes":[],"generalSuggestions":[]}}';

        // Remove markdown code blocks if present
        content = content.replace(/^```(?:json)?\n|\n```$/g, "");
        // Clean up any remaining markdown artifacts
        content = content.trim();

        return JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse LLM response as JSON:", parseError);
        return {
          analysis: {
            summary: "Failed to parse analysis",
            improvements: [],
            bestPractices: [],
            reviewers: [],
          },
          suggestions: {
            codeFixes: [],
            generalSuggestions: [],
          },
        };
      }
    } catch (error) {
      console.error("Error analyzing PR:", error);
      throw error;
    }
  }

  // helper method to save PR to the database
  async savePRToDatabase(
    pr: any,
    result: { analysis: any; suggestions: any },
    diff: string
  ) {
    try {
      const existingPr = await prisma.pullRequest.findUnique({
        where: { githubId: pr.id.toString() },
      });

      // Extract repo info from repository_url if base is not available
      let repoOwner, repoName;
      if (pr.base?.repo) {
        repoOwner = pr.base.repo.owner.login;
        repoName = pr.base.repo.name;
      } else if (pr.repository_url) {
        [repoOwner, repoName] = pr.repository_url
          .split("/repos/")[1]
          .split("/");
      } else {
        throw new Error("Unable to determine repository information");
      }

      // Convert objects to strings for database storage
      const analysisString =
        typeof result.analysis === "object"
          ? JSON.stringify(result.analysis)
          : result.analysis || null;

      const suggestionsString =
        typeof result.suggestions === "object"
          ? JSON.stringify(result.suggestions)
          : result.suggestions || null;

      const prData = {
        githubId: pr.id.toString(),
        title: pr.title,
        body: pr.body || "",
        analysis: analysisString,
        suggestions: suggestionsString,
        diff,
        status: pr.state,
        number: pr.number,
        repoName,
        repoOwner,
        updatedAt: new Date(),
      };

      if (existingPr) {
        return await prisma.pullRequest.update({
          where: { githubId: pr.id.toString() },
          data: prData,
        });
      } else {
        return await prisma.pullRequest.create({
          data: {
            ...prData,
            createdAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error saving PR to database:", error);
      throw error;
    }
  }
}
