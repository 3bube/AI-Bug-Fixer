"use client";

import { useState } from "react";
import Link from "next/link";
import { PullRequest } from "@/types/prs";
import { usePrs } from "@/hooks/usePr";

export default function PullRequestDashboard() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const { data, isLoading } = usePrs(page, perPage);

  console.log("Pull Requests Data:", data);

  const processedPrs =
    data?.data?.map((pr: PullRequest) => ({
      ...pr,
      repository: pr.repository,
    })) || [];

  // console.log(processedPrs?.map((pr) => pr.title));

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
        <div className="text-gray-400">Loading pull requests...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Pull Requests</h2>
        <div className="text-sm text-gray-400">
          {processedPrs.length} pull request
          {processedPrs.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid gap-4">
        {processedPrs.map((pr: PullRequest) => {
          // Parse repository information correctly
          // If repository contains slash, it's in format "owner/repo"
          const [repoOwner, repoName] = pr.repository?.includes("/")
            ? pr.repository.split("/")
            : ["unknown", pr.repository ?? "unknown"];

          return (
            <Link
              key={pr.id}
              href={`/pr/${pr.number}?owner=${repoOwner}&repo=${repoName}`}
              className="block bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {pr.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="font-mono">{pr.repository}</span>
                    <span>#{pr.number}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    pr.state
                  )}`}
                >
                  {pr.state}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {processedPrs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No pull requests found</div>
          <div className="text-sm text-gray-500">
            Pull requests will appear here when available
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {data?.pagination && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex items-center text-sm text-gray-400">
            <span>
              Showing {(page - 1) * perPage + 1} to{" "}
              {Math.min(page * perPage, data.pagination.total)} of{" "}
              {data.pagination.total} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 text-sm rounded-md transition-colors
                ${
                  page === 1
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              Previous
            </button>

            <span className="text-sm text-gray-400">
              Page {page} of {data.pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasNextPage}
              className={`px-4 py-2 text-sm rounded-md transition-colors
                ${
                  !data.pagination.hasNextPage
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
