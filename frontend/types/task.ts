export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  category: string;
  project?: string;
  completed: boolean;
  overdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

export interface TaskFilters {
  search: string;
  priority: "all" | "low" | "medium" | "high";
  category: string;
  dateRange: "all" | "today" | "upcoming" | "overdue";
  completed: boolean;
}

export type ViewMode = "all" | "today" | "upcoming" | "completed" | "projects";
