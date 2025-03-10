"use client";
import { useEffect, useState } from "react";
import { useTasks } from "@/lib/context/TaskContext";
import TaskCard from "@/components/marketplace.tsx/TaskCard";
import { PlusCircle } from "lucide-react";
import CreateTaskForm from "@/components/marketplace.tsx/createTaskForm";

export default function TasksPage() {
  const { tasks, loading, refreshTasks } = useTasks();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  useEffect(() => {
    refreshTasks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Active Tasks</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
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
