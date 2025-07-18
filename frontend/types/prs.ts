export interface PullRequest {
  id: number;
  title: string;
  repository_url: string;
  repository?: string;
  number: number;
  state: string;
  html_url: string;
  user?: {
    login: string;
    id: number;
    avatar_url: string;
  };
  diff?: string;
  analysis?: {
    summary: string;
    improvements: string[];
    bestPractices: string[];
    reviewers: string[];
  };
  suggestions?: {
    codeFixes: Array<{
      file: string;
      description: string;
      suggestedCode: string;
    }>;
    generalSuggestions: string[];
  };
  savedId?: number;
}

export interface PaginatedResponse {
  data: PullRequest[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}
