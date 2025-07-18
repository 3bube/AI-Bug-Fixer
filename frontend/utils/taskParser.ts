import { Task } from "../types/prs";

export const parseNaturalLanguage = (input: string): Partial<Task> => {
  const task: Partial<Task> = {
    title: input,
    priority: "medium",
    category: "General",
    completed: false,
    overdue: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Extract due date patterns
  const datePatterns = [
    /tomorrow/i,
    /today/i,
    /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\d{1,2}\/\d{1,2}\/?\d{0,4}/,
    /\d{1,2}-\d{1,2}-?\d{0,4}/,
    /(january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}/i,
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      const dateStr = match[0];
      let dueDate = new Date();

      if (dateStr.toLowerCase() === "tomorrow") {
        dueDate.setDate(dueDate.getDate() + 1);
      } else if (dateStr.toLowerCase() === "today") {
        // Keep today's date
      } else if (dateStr.toLowerCase().includes("next")) {
        const dayName = dateStr.split(" ")[1];
        dueDate = getNextWeekday(dayName);
      } else if (dateStr.toLowerCase().includes("this")) {
        const dayName = dateStr.split(" ")[1];
        dueDate = getThisWeekday(dayName);
      } else {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          dueDate = parsed;
        }
      }

      task.dueDate = dueDate;
      task.title = input.replace(pattern, "").trim();
      break;
    }
  }

  // Extract time patterns
  const timePatterns = [
    /at (\d{1,2}):?(\d{2})?\s?(am|pm)/i,
    /(\d{1,2}):(\d{2})\s?(am|pm)/i,
    /(\d{1,2})\s?(am|pm)/i,
  ];

  for (const pattern of timePatterns) {
    const match = input.match(pattern);
    if (match) {
      task.title = task.title?.replace(pattern, "").trim() || "";
      break;
    }
  }

  // Extract priority indicators
  const priorityPatterns = [
    {
      pattern: /urgent|asap|immediately|high priority/i,
      priority: "high" as const,
    },
    { pattern: /low priority|later|sometime|maybe/i, priority: "low" as const },
  ];

  for (const { pattern, priority } of priorityPatterns) {
    if (input.match(pattern)) {
      task.priority = priority;
      task.title = task.title?.replace(pattern, "").trim() || "";
      break;
    }
  }

  // Extract category/project indicators
  const categoryPatterns = [
    { pattern: /work|office|meeting|project/i, category: "Work" },
    { pattern: /personal|home|family/i, category: "Personal" },
    { pattern: /health|doctor|gym|exercise/i, category: "Health" },
    { pattern: /shop|buy|purchase|grocery/i, category: "Shopping" },
  ];

  for (const { pattern, category } of categoryPatterns) {
    if (input.match(pattern)) {
      task.category = category;
      break;
    }
  }

  // Clean up title
  task.title = task.title?.replace(/\s+/g, " ").trim() || input;

  return task;
};

function getNextWeekday(dayName: string): Date {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = days.indexOf(dayName.toLowerCase());

  if (targetIndex === -1) return today;

  const daysUntilTarget = (targetIndex - todayIndex + 7) % 7 || 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);

  return targetDate;
}

function getThisWeekday(dayName: string): Date {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = days.indexOf(dayName.toLowerCase());

  if (targetIndex === -1) return today;

  const daysUntilTarget = (targetIndex - todayIndex + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);

  return targetDate;
}
