import { getTaskSections } from "@/actions/tasks";
import { TasksView } from "./tasks-view";

export default async function TasksPage() {
  const sections = await getTaskSections();

  // Serialize dates for client
  const serializeTasks = (tasks: typeof sections.overdue) => 
    tasks.map(task => ({
      ...task,
      nextDue: task.nextDue,
      lastCompleted: task.lastCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completions: task.completions?.map(c => ({
        ...c,
        completedAt: c.completedAt
      }))
    }));

  return <TasksView 
    sections={{
      overdue: serializeTasks(sections.overdue),
      dueToday: serializeTasks(sections.dueToday),
      upcomingThisWeek: serializeTasks(sections.upcomingThisWeek),
      later: serializeTasks(sections.later),
    }}
    stats={sections.stats}
  />;
}
