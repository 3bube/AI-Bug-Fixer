import axios from "axios";
import { PaginatedResponse } from "@/types/prs";

interface GetPrParams {
  page?: number;
  perPage?: number;
}

export const getPr = async ({
  page = 1,
  perPage = 10,
}: GetPrParams = {}): Promise<PaginatedResponse> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/prs/user`,
      {
        params: {
          page,
          per_page: perPage,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("github_token")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return {
      data: [],
      pagination: {
        currentPage: page,
        perPage,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }
};

export const getPrById = async (id: number, owner: string, repo: string) => {
  try {
    // Split the repo parameter if it contains a slash to get the actual owner and repo
    const [repoOwner, repoName] = repo.includes("/")
      ? repo.split("/")
      : [owner, repo];

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/pr/${id}/${repoOwner}/${repoName}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("github_token")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching pull request by ID:", error);
    throw error;
  }
};

export const approveFix = async (
  owner: string,
  repo: string,
  filePath: string,
  newContent: string
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/pr/approve-fix`,
      {
        owner,
        repo,
        filePath,
        newContent,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("github_token")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error approving fix:", error);
    throw error;
  }
};
