"use client";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/context/AuthProvider";
import { toast } from "sonner";
import { useTasks } from "@/lib/context/TaskContext";

export default function CreateTaskForm({
  onClose,
}: //   fetch,
{
  onClose: () => void;
  //   fetch: (x: any) => void;
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reward, setReward] = useState("");
  const [status, setStatus] = useState("pending");

  const { user } = useAuth();
  // console.log(user);
  const { refreshTasks } = useTasks();

  // const priorities = ["Low", "Medium", "High"];
  const statuses = ["pending", "in-progress", "completed", "expired"];

  // 📌 Create a new task in Firestore
  const createTask = async () => {
    if (!taskTitle || !description || !dueDate || !reward) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!dueDate < new Date()) {
      setStatus("expired");
    }

    try {
      const newTask = {
        taskTitle,
        description,
        deadline: dueDate,
        reward,
        status,
        creator: user.uid,
        appliedPeople: [],
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "tasks"), newTask);
      console.log("Task created with ID:", docRef.id);
      toast("Task Created Successfully!");

      // Reset Form
      setTaskTitle("");
      setDescription("");
      setDueDate("");

      setStatus("pending");
      refreshTasks();
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error creating task:", error);
      toast("Failed to create task. Try again!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>

        <label>Task Title:</label>
        <input
          type="text"
          placeholder="Enter Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <label>Description:</label>
        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
          rows={3}
        ></textarea>

        <label>Due Date:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <label>Reward:</label>
        <input
          type="number"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={createTask}>Create</Button>
        </div>
      </div>
    </div>
  );
}
