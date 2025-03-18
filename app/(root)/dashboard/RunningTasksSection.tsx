"use client";
import { useAuth } from "@/lib/context/AuthProvider";
import { db } from "@/lib/firebaseConfig";
import { getUserFromDB } from "@/lib/firebaseutils";
import { arrayUnion, doc, increment, updateDoc } from "firebase/firestore";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

const RunningTasksSection = ({
  tasks,
  emptyMessage,
}: {
  tasks: any[];
  emptyMessage: string;
}) => {
  const { user } = useAuth();
  // console.log("tasks", tasks);
  const [assignedUsers, setAssignedUsers] = useState<{ [key: string]: any }>(
    {}
  );

  // Move runningTasks inside useEffect to prevent infinite loop
  useEffect(() => {
    const runningTasks = tasks.filter((task) => task.status == "accepted");
    // console.log("Running tasks:", runningTasks);
    const fetchAssignedUsers = async () => {
      const users: { [key: string]: any } = {};
      for (const task of runningTasks) {
        if (task.assignedTo) {
          const assignedUser = await getUserFromDB(task.assignedTo);
          if (assignedUser) {
            users[task.id] = assignedUser;
          }
        }
      }
      setAssignedUsers(users);
    };

    fetchAssignedUsers();
  }, [tasks]); // Only depend on tasks prop

  const handleTaskComplete = async (taskId: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completedByUser: true,
      });
      toast.success(
        "Task marked as completed. Waiting for creator verification."
      );
    } catch (error) {
      toast.error("Failed to mark task as complete");
    }
  };

  const handleCreatorVerify = async (
    taskId: string,
    reward: string,
    assignedTo: string
  ) => {
    try {
      // Update task status
      await updateDoc(doc(db, "tasks", taskId), {
        status: "completed",
        completedByCreator: true,
      });

      // Update assigned user's wallet
      const assignedUserRef = doc(db, "users", assignedTo);
      await updateDoc(assignedUserRef, {
        wallet: increment(parseInt(reward)),
        completedTasks: arrayUnion(taskId),
      });

      // Trigger immediate wallet refresh in parent component
      if (typeof window !== "undefined") {
        const event = new CustomEvent("walletUpdated", {
          detail: { userId: assignedTo },
        });
        window.dispatchEvent(event);
      }

      toast.success("Task verified and reward transferred!");
    } catch (error) {
      toast.error("Failed to verify task");
    }
  };

  // Filter running tasks here for render
  const runningTasks = tasks.filter(
    (task) => task.status === "accepted" && task.creator === user?.uid
  );
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Running Tasks</h3>
      {runningTasks.length > 0 ? (
        <div className="space-y-6">
          {runningTasks.map((task) => {
            const assignedUser = assignedUsers[task.id];
            return (
              <div
                key={task.id}
                className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-lg">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="mt-2 space-x-2">
                      <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Reward: {task.reward}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Status:{" "}
                        {task.completedByUser
                          ? "Pending Creator Verification"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned User Info */}
                {assignedUser && (
                  <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Assigned To:
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Link href={`/profile/${assignedUser.uid}`}>
                          <Image
                            src={assignedUser.image || "/default-avatar.png"}
                            alt={assignedUser.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <span className="font-medium">
                            {assignedUser.name}
                          </span>
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {/* Button for assigned user */}
                        {user?.uid === task.assignedTo &&
                          !task.completedByUser && (
                            <button
                              onClick={() => handleTaskComplete(task.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                            >
                              <FaCheck className="w-4 h-4" />
                              <span>Mark as Complete</span>
                            </button>
                          )}

                        {/* Button for creator */}
                        {user?.uid === task.creator &&
                          task.completedByUser &&
                          !task.completedByCreator && (
                            <button
                              onClick={() =>
                                handleCreatorVerify(
                                  task.id,
                                  task.reward,
                                  task.assignedTo
                                )
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                            >
                              <FaCheck className="w-4 h-4" />
                              <span>Verify & Pay</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Status:</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={
                          task.completedByUser
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ● Task Completed
                      </span>
                      <span>→</span>
                      <span
                        className={
                          task.completedByCreator
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ● Payment Released
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      )}
    </div>
  );
};

export default RunningTasksSection;
