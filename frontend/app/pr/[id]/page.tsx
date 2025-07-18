"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { PullRequest } from "@/types/prs";
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
  const [pr, setPr] = useState<PullRequestDetail | null>(null);
  const [success, setSuccess] = useState(false);
  const [approving, setApproving] = useState(false);

  const prId = parseInt(params.id as string, 10);
  const owner = searchParams?.get("owner") || "";
  const repo = searchParams?.get("repo") || "";

  const { data: prData, isLoading } = usePrById(prId, owner, repo);

  const analysis = prData?.analysis?.analysis || {};
  const suggestions = prData?.analysis?.suggestions || {};

  const handleApproveFix = async () => {
    if (!pr) return;

    setApproving(true);
    try {
      const response = await fetch(`/api/prs/${pr.id}/approve-fix`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        console.error("Failed to approve fix");
      }
    } catch (err) {
      console.error("Error approving fix:", err);
    } finally {
      setApproving(false);
    }
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
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium text-white">Code Changes</h3>
          </div>
          <div className="p-4">
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto code-scroll max-h-96">
              <code className="text-gray-300">{prData.diff}</code>
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
                {analysis?.improvements?.map((improvement, index) => (
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
                {analysis?.bestPractices?.map((practice, index) => (
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
            {suggestions?.codeFixes?.map((fix, index) => (
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
              </div>
            ))}

            {suggestions?.generalSuggestions?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">
                  General Suggestions
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  {suggestions?.generalSuggestions?.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {prData.state !== "closed" && (
              <button
                onClick={handleApproveFix}
                disabled={approving}
                className="mt-6 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded font-medium transition-colors disabled:cursor-not-allowed"
              >
                {approving ? "Approving..." : "Approve Fix"}
              </button>
            )}

            {success && (
              <div className="mt-6 text-green-400 font-medium">
                ✓ Fix approved and applied
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
              {analysis?.reviewers?.map((reviewer, index) => (
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
