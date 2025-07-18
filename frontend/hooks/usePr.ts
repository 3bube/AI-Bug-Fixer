import { useQuery } from "@tanstack/react-query";
import { getPr, getPrById } from "@/api/pr";
import { PaginatedResponse } from "@/types/prs";

export const usePrs = (page: number = 1, perPage: number = 10) => {
  return useQuery<PaginatedResponse>({
    queryKey: ["pullRequests", page, perPage],
    queryFn: () => getPr({ page, perPage }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev, // Keep old data while fetching new data
  });
};

export const usePrById = (id: number, owner: string, repo: string) => {
  return useQuery({
    queryKey: ["pullRequest", id, owner, repo],
    queryFn: () => getPrById(id, owner, repo),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev, // Keep old data while fetching new data
  });
};
