"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X } from "lucide-react";

interface TaskInputProps {
  onAddTask: (naturalLanguage: string) => void;
  showTooltip: boolean;
  onDismissTooltip: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({
  onAddTask,
  showTooltip,
  onDismissTooltip,
}) => {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTask(input.trim());
      setInput("");
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    if (showTooltip) {
      onDismissTooltip();
    }
  };

  return (
    <div className="relative">
      {showTooltip && (
        <div className="absolute -top-20 left-4 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Try natural language:</strong> "Remind me to call John
                tomorrow at 2 PM" or "Schedule team meeting next Friday"
              </p>
            </div>
            <button
              onClick={onDismissTooltip}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
            >
              <X className="w-4 h-4 text-blue-500" />
            </button>
          </div>
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-blue-50 dark:bg-blue-900/20 border-r border-b border-blue-200 dark:border-blue-700 transform rotate-45"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 ${
            isExpanded
              ? "border-blue-300 dark:border-blue-600 shadow-lg"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <div className="flex items-center space-x-3 p-4">
            <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={handleFocus}
              onBlur={() => !input && setIsExpanded(false)}
              placeholder="What would you like to work on? (Try natural language...)"
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            {input && (
              <button
                type="submit"
                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {isExpanded && (
            <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-400">
              <p>
                Examples: "Call mom tomorrow", "Team meeting Friday 3pm", "Buy
                groceries this weekend"
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
