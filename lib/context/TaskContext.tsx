"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthProvider";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string; // Store as YYYY-MM-DD HH:mm
  creator: string;
  assignedTo?: string;
  status: "live" | "accepted" | "expired";
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Task) => Promise<void>;
  acceptTask: (taskId: string, userId: string) => Promise<void>;
  deleteTask: (taskId: string, reward: string) => Promise<void>;
  refreshTasks: () => void;
  getTasks: () => Promise<void>;
  joinTask: (taskID: string, userId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUser, userData } = useAuth();
  // const userId = user?.uid;

  // Fetch tasks from Firestore
  const getTasks = async () => {
    try {
      const now = new Date();
      const tasksSnapshot = await getDocs(collection(db, "tasks"));

      const tasksWithDetails = await Promise.all(
        tasksSnapshot.docs.map(async (taskDoc) => {
          const taskData = taskDoc.data() as Omit<Task, "id">;
          const taskDeadline = new Date(taskData.deadline);

          // Mark expired tasks
          if (taskDeadline < now && taskData.status !== "expired") {
            await updateDoc(doc(db, "tasks", taskDoc.id), {
              status: "expired",
            });
          }

          return {
            id: taskDoc.id,
            ...taskData,
          };
        })
      );

      setTasks(tasksWithDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  const addTask = async (task: Task) => {
    try {
      const taskRef = doc(collection(db, "tasks"));
      await updateDoc(taskRef, task);
      refreshTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  const joinTask = async (taskID: string, userId: string) => {
    try {
      const taskRef = doc(db, "tasks", taskID);
      await updateDoc(taskRef, { appliedPeople: arrayUnion(userId) });
      await updateUser({ joinedTasks: arrayUnion(taskID) });
    } catch (error) {
      console.error("Error joining task:", error);
    }
  };

  const acceptTask = async (taskId: string, userId: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: "accepted",
        assignedTo: userId,
        // Remove the accepted user from appliedPeople array
        appliedPeople: arrayRemove(userId),
      });
      toast.success("Task assigned successfully!");
      refreshTasks();
    } catch (error) {
      console.error("Error accepting task:", error);
      toast.error("Failed to assign task");
    }
  };

  const deleteTask = async (taskId: string, reward: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      await updateUser({ wallet: userData?.wallet + parseInt(reward) });
      toast.success("Task deleted successfully!");
      refreshTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const refreshTasks = () => {
    getTasks();
  };

  useEffect(() => {
    if (user) {
      getTasks();
    }
  }, [user]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        getTasks,
        loading,
        addTask,
        acceptTask,
        deleteTask,
        refreshTasks,
        joinTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
