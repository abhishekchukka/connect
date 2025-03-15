"use client";
import { useEffect, useState } from "react";
import { useTasks } from "@/lib/context/TaskContext";
import TaskCard from "@/components/marketplace.tsx/TaskCard";
import { PlusCircle } from "lucide-react";
import CreateTaskForm from "@/components/marketplace.tsx/createTaskForm";
// import { getUserFromDB } from "@/lib/firebaseutils";
import { useAuth } from "@/lib/context/AuthProvider";
import { useRouter } from "next/navigation";
import LoginPrompt from "@/components/ui/loginBanner";

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { tasks, refreshTasks } = useTasks();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const filteredTasks = tasks.filter((task) => task.status === "pending");
  useEffect(() => {
    refreshTasks();
  }, []);
  if (!user) {
    return <LoginPrompt />;
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Active Tasks</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <p>No tasks available.</p>
          )}
        </div>
      )}

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
        onClick={() => {
          setShowNewTaskModal(true);
        }}
      >
        <PlusCircle size={24} />
      </button>

      {showNewTaskModal && (
        <CreateTaskForm onClose={() => setShowNewTaskModal(false)} />
      )}
    </div>
  );
}
