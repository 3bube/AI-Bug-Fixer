import { useMutation } from "@tanstack/react-query";
import { approveFix } from "@/api/pr";

type ApproveFixVariables = {
  prId: number;
  owner: string;
  repo: string;
  filePath: string;
  newContent: string;
  pullNumber: number;
};

export const useApproveFix = () => {
  return useMutation({
    mutationFn: ({
      owner,
      repo,
      filePath,
      newContent,
      pullNumber,
    }: ApproveFixVariables) =>
      approveFix(owner, repo, filePath, newContent, pullNumber),
    onSuccess: (data: any) => {
      console.log("Fix approved successfully:", data);
    },
    onError: (error: any) => {
      console.error("Error approving fix:", error);
    },
  });
};
