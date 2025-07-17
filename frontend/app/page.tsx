"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import FilterBar from "@/components/FilterBar";
import { Task, TaskFilters, ViewMode } from "@/types/task";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseNaturalLanguage } from "@/utils/taskParser";

function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false);
  const [activeView, setActiveView] = useState<ViewMode>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useLocalStorage("showTooltip", true);
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    priority: "all",
    category: "",
    dateRange: "all",
    completed: false,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Sample projects data
  const projects = [
    { id: "1", name: "Website Redesign", color: "#3B82F6", taskCount: 5 },
    { id: "2", name: "Mobile App", color: "#10B981", taskCount: 3 },
    { id: "3", name: "Marketing Campaign", color: "#F59E0B", taskCount: 2 },
  ];

  // Filter tasks based on active view and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // View-based filtering
    switch (activeView) {
      case "today":
        filtered = filtered.filter((task) => {
          if (!task.dueDate) return false;
          const today = new Date();
          return task.dueDate.toDateString() === today.toDateString();
        });
        break;
      case "upcoming":
        filtered = filtered.filter((task) => {
          if (!task.dueDate) return false;
          const today = new Date();
          return task.dueDate > today;
        });
        break;
      case "completed":
        filtered = filtered.filter((task) => task.completed);
        break;
      case "projects":
        filtered = filtered.filter((task) => task.project);
        break;
      default:
        filtered = filtered.filter((task) => !task.completed);
    }

    // Apply additional filters
    if (filters.search) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter((task) =>
        task.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.dateRange !== "all") {
      const today = new Date();
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false;

        switch (filters.dateRange) {
          case "today":
            return task.dueDate.toDateString() === today.toDateString();
          case "upcoming":
            return task.dueDate > today;
          case "overdue":
            return task.dueDate < today && !task.completed;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [tasks, activeView, filters]);

  // Calculate task counts for sidebar
  const taskCounts = useMemo(() => {
    const today = new Date();
    return {
      all: tasks.filter((task) => !task.completed).length,
      today: tasks.filter(
        (task) =>
          task.dueDate && task.dueDate.toDateString() === today.toDateString()
      ).length,
      upcoming: tasks.filter((task) => task.dueDate && task.dueDate > today)
        .length,
      completed: tasks.filter((task) => task.completed).length,
    };
  }, [tasks]);

  const addTask = (naturalLanguage: string) => {
    setLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const parsedTask = parseNaturalLanguage(naturalLanguage);
      const newTask: Task = {
        id: Date.now().toString(),
        title: parsedTask.title || naturalLanguage,
        description: parsedTask.description,
        dueDate: parsedTask.dueDate,
        priority: parsedTask.priority || "medium",
        category: parsedTask.category || "General",
        project: parsedTask.project,
        completed: false,
        overdue: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
      setLoading(false);
    }, 500);
  };

  const saveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData, updatedAt: new Date() }
            : task
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title || "",
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority || "medium",
        category: taskData.category || "General",
        project: taskData.project,
        completed: false,
        overdue: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
    }
    setEditingTask(undefined);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      )
    );
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const openModal = () => {
    setEditingTask(undefined);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(undefined);
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${
        darkMode ? "dark" : ""
      }`}
    >
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="flex h-[calc(100vh-72px)]">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          projects={projects}
          taskCounts={taskCounts}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {activeView === "all" && "All Tasks"}
                {activeView === "today" && "Today"}
                {activeView === "upcoming" && "Upcoming"}
                {activeView === "completed" && "Completed"}
                {activeView === "projects" && "Projects"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeView === "all" &&
                  "Manage your tasks and stay productive"}
                {activeView === "today" &&
                  "Focus on what needs to be done today"}
                {activeView === "upcoming" &&
                  "Plan ahead with your upcoming tasks"}
                {activeView === "completed" && "Review your completed tasks"}
                {activeView === "projects" && "Organize tasks by project"}
              </p>
            </div>

            <TaskInput
              onAddTask={addTask}
              showTooltip={showTooltip}
              onDismissTooltip={() => setShowTooltip(false)}
            />

            <FilterBar filters={filters} onFiltersChange={setFilters} />

            <TaskList
              tasks={filteredTasks}
              onToggleComplete={toggleTaskComplete}
              onEditTask={editTask}
              onDeleteTask={deleteTask}
              loading={loading}
            />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TaskModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={saveTask}
        task={editingTask}
      />
    </div>
  );
}

export default Home;
