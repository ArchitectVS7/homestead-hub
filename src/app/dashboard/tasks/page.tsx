import { getTasks } from "@/actions/tasks";
import { TasksView } from "./tasks-view";

export default async function TasksPage() {
  const tasks = await getTasks({ status: "all" });

  // Serialize dates for client
  const serializedTasks = tasks.map(task => ({
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

  return <TasksView initialTasks={serializedTasks} />;
}
