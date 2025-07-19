"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { PullRequest } from "@/types/prs";
import { useApproveFix } from "@/hooks/useApproveFix";
import { usePrById } from "@/hooks/usePr";

interface CodeFix {
  file: string;
  description: string;
  suggestedCode: string;
}

interface Analysis {
  summary: string;
  improvements: string[];
  bestPractices: string[];
  reviewers: string[];
}

interface Suggestions {
  codeFixes: CodeFix[];
  generalSuggestions: string[];
}

interface PullRequestDetail {
  id: number;
  title: string;
  repository: string;
  number: number;
  status: "Pending" | "Analyzed" | "Fixed";
  diff: string;
  analysis: Analysis;
  suggestions: Suggestions;
}

export default function PullRequestDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [animatingFix, setAnimatingFix] = useState<number | null>(null);
  const [animatedDiff, setAnimatedDiff] = useState<string>("");

  const prId = parseInt(params.id as string, 10);
  const ownerParam = searchParams?.get("owner") || "";
  const repoParam = searchParams?.get("repo") || "";

  // Parse repository information correctly
  // If repo contains slash, it's in format "owner/repo", otherwise use separate owner and repo
  const [owner, repo] = repoParam.includes("/")
    ? repoParam.split("/")
    : [ownerParam, repoParam];

  const { data: prData, isLoading } = usePrById(prId, owner, repo);
  const { mutate: approveFix, isPending: isApproving } = useApproveFix();

  const analysis = prData?.analysis?.analysis || {};
  const suggestions = prData?.analysis?.suggestions || {};

  // Function to animate diff changes
  const animateDiffChanges = (fixIndex: number, fix: CodeFix) => {
    setAnimatingFix(fixIndex);
    const originalDiff = prData?.diff || "";

    // Create animated diff showing the change being applied
    const lines = originalDiff.split("\n");
    const animatedLines = lines.map((line: any) => {
      if (line.includes(fix.file)) {
        return line;
      }
      if (line.startsWith("-")) {
        return line; // Keep removed lines
      }
      if (line.startsWith("+")) {
        return line; // Keep added lines
      }
      return line;
    });

    // Add animation for the new fix being applied
    animatedLines.push("");
    animatedLines.push(`diff --git a/${fix.file} b/${fix.file}`);
    animatedLines.push(`index 1234567..abcdefg 100644`);
    animatedLines.push(`--- a/${fix.file}`);
    animatedLines.push(`+++ b/${fix.file}`);
    animatedLines.push(`@@ -1,3 +1,3 @@`);

    // Simulate typing effect for the new content
    const newContentLines = fix.suggestedCode.split("\n");
    newContentLines.forEach((line, index) => {
      animatedLines.push(`+${line}`);
    });

    let currentText = "";
    const fullText = animatedLines.join("\n");
    let index = 0;

    const typeWriter = () => {
      if (index < fullText.length) {
        currentText += fullText.charAt(index);
        setAnimatedDiff(currentText);
        index++;
        setTimeout(typeWriter, 8); // Faster typing speed
      } else {
        // Animation complete, reset after 2 seconds
        setTimeout(() => {
          setAnimatingFix(null);
          setAnimatedDiff("");
        }, 900);
      }
    };

    typeWriter();
  };

  const handleApproveFix = async (fixIndex: number, fix: CodeFix) => {
    if (!owner || !repo) {
      console.error("Missing owner or repo information");
      return;
    }

    if (!prData?.number) {
      console.error("Missing pull request number");
      return;
    }

    // Start animation
    animateDiffChanges(fixIndex, fix);

    approveFix(
      {
        prId,
        owner,
        repo,
        filePath: fix.file,
        newContent: fix.suggestedCode,
        pullNumber: prData.number,
      },
      {
        onSuccess: () => {
          setAppliedFixes((prev) => new Set(prev).add(fixIndex));
        },
        onError: (error) => {
          console.error("Failed to approve fix:", error);
          // Stop animation on error
          setAnimatingFix(null);
          setAnimatedDiff("");
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-600 text-yellow-100";
      case "closed":
        return "bg-red-900 text-blue-100";
      case "Fixed":
        return "bg-green-600 text-green-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Loading pull request...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/pr"
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              {prData.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="font-mono">{prData.repository}</span>
              <span>#{prData.number}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              prData.state
            )}`}
          >
            {prData.state}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Code Diff */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-white">Code Changes</h3>
            {animatingFix !== null && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs">Applying fix...</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto code-scroll max-h-96 relative">
              <code className="text-gray-300 whitespace-pre-wrap font-mono">
                {animatingFix !== null ? (
                  <span className="relative">
                    <style jsx>{`
                      @keyframes typewriter {
                        from {
                          width: 0;
                        }
                        to {
                          width: 100%;
                        }
                      }
                      @keyframes blink {
                        0%,
                        50% {
                          opacity: 1;
                        }
                        51%,
                        100% {
                          opacity: 0;
                        }
                      }
                      .diff-line-add {
                        background-color: rgba(34, 197, 94, 0.1);
                        border-left: 3px solid #22c55e;
                        padding-left: 8px;
                        animation: slideInLeft 0.3s ease-out;
                      }
                      .diff-line-remove {
                        background-color: rgba(239, 68, 68, 0.1);
                        border-left: 3px solid #ef4444;
                        padding-left: 8px;
                        animation: slideInLeft 0.3s ease-out;
                      }
                      @keyframes slideInLeft {
                        from {
                          transform: translateX(-10px);
                          opacity: 0;
                        }
                        to {
                          transform: translateX(0);
                          opacity: 1;
                        }
                      }
                    `}</style>
                    {animatedDiff
                      .split("\n")
                      .map((line: string, idx: number) => (
                        <div
                          key={idx}
                          className={
                            line.startsWith("+")
                              ? "diff-line-add text-green-300"
                              : line.startsWith("-")
                              ? "diff-line-remove text-red-300"
                              : line.startsWith("@@")
                              ? "text-cyan-400 font-semibold"
                              : line.startsWith("diff --git")
                              ? "text-yellow-400 font-semibold"
                              : "text-gray-300"
                          }
                        >
                          {line}
                        </div>
                      ))}
                    <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></span>
                  </span>
                ) : (
                  <span>
                    {prData.diff
                      ?.split("\n")
                      .map((line: string, idx: number) => (
                        <div
                          key={idx}
                          className={
                            line.startsWith("+")
                              ? "text-green-300 bg-green-900/20 border-l-2 border-green-500 pl-2"
                              : line.startsWith("-")
                              ? "text-red-300 bg-red-900/20 border-l-2 border-red-500 pl-2"
                              : line.startsWith("@@")
                              ? "text-cyan-400 font-semibold"
                              : line.startsWith("diff --git")
                              ? "text-yellow-400 font-semibold"
                              : "text-gray-300"
                          }
                        >
                          {line}
                        </div>
                      ))}
                  </span>
                )}
              </code>
            </pre>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium text-white">Analysis Summary</h3>
          </div>
          <div className="p-4">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {analysis?.summary}
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Improvements */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-medium text-white">Improvements</h3>
            </div>
            <div className="p-4">
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {analysis?.improvements?.map((improvement: any, index: any) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-medium text-white">Best Practices</h3>
            </div>
            <div className="p-4">
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {analysis?.bestPractices?.map((practice: any, index: any) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Suggested Fixes */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium text-white">Suggested Fixes</h3>
          </div>
          <div className="p-4 space-y-6">
            {suggestions?.codeFixes?.map((fix: any, index: any) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-mono text-sm">
                    {fix.file}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-gray-300">{fix.description}</span>
                </div>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto code-scroll">
                  <code className="text-green-300">{fix.suggestedCode}</code>
                </pre>

                {prData.state !== "closed" && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleApproveFix(index, fix)}
                      disabled={isApproving || appliedFixes.has(index)}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      {appliedFixes.has(index)
                        ? "✓ Applied"
                        : isApproving
                        ? "Applying..."
                        : "Apply Fix"}
                    </button>
                    {appliedFixes.has(index) && (
                      <span className="text-green-400 text-sm">
                        Fix has been applied to the repository
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {suggestions?.generalSuggestions?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">
                  General Suggestions
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  {suggestions?.generalSuggestions?.map(
                    (suggestion: any, index: any) => (
                      <li key={index}>{suggestion}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reviewers */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium text-white">Suggested Reviewers</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {analysis?.reviewers?.map((reviewer: any, index: any) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                >
                  {reviewer}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
