"use client";

import React from "react";
import {
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle,
  Folder,
  Plus,
} from "lucide-react";
import { ViewMode } from "../types/task";

interface SidebarProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    taskCount: number;
  }>;
  taskCounts: {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  projects,
  taskCounts,
}) => {
  const navigationItems = [
    {
      id: "all" as ViewMode,
      label: "All Tasks",
      icon: CheckSquare,
      count: taskCounts.all,
    },
    {
      id: "today" as ViewMode,
      label: "Today",
      icon: Calendar,
      count: taskCounts.today,
    },
    {
      id: "upcoming" as ViewMode,
      label: "Upcoming",
      icon: Clock,
      count: taskCounts.upcoming,
    },
    {
      id: "completed" as ViewMode,
      label: "Completed",
      icon: CheckCircle,
      count: taskCounts.completed,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full">
      <nav className="p-4">
        {/* Main Navigation */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.label}</span>
                {item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Projects
            </h3>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveView("projects")}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300 flex-1">
                  {project.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {project.taskCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
