"use client";
import { useAuth } from "@/lib/context/AuthProvider";
import { getUserFromDB } from "@/lib/firebaseutils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";
interface AppliedUser {
  uid: string;
  name: string;
  image: string;
}

// Define task status priority for sorting
const statusPriority: { [key: string]: number } = {
  pending: 1,
  active: 2,
  accepted: 3,
  completed: 4,
  expired: 5,
};

const TaskSection = ({
  tasks,
  emptyMessage,
  onAcceptUser,
  onDeleteTask,
  userData,
}: {
  tasks: any[];
  emptyMessage: string;
  onAcceptUser: (taskId: string, userId: string) => Promise<void>;
  onDeleteTask: (taskId: string, reward: string) => Promise<void>;
  userData: any;
}) => {
  const [appliedUsers, setAppliedUsers] = useState<{
    [key: string]: AppliedUser[];
  }>({});
  const [assignedUsers, setAssignedUsers] = useState<{ [key: string]: any }>(
    {}
  );
  const [sortedTasks, setSortedTasks] = useState<any[]>([]);
  const { user } = useAuth();

  // Sort tasks by status priority
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const sorted = [...tasks].sort((a, b) => {
        const priorityA = statusPriority[a.status] || 999;
        const priorityB = statusPriority[b.status] || 999;

        // First sort by status priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
      });

      setSortedTasks(sorted);
    } else {
      setSortedTasks([]);
    }
  }, [tasks]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData: { [key: string]: AppliedUser[] } = {};
      const assignedUsersData: { [key: string]: any } = {};

      for (const task of sortedTasks) {
        // Fetch applied users
        if (task.appliedPeople && task.appliedPeople.length > 0) {
          const users = await Promise.all(
            task.appliedPeople.map(async (userId: string) => {
              const user = await getUserFromDB(userId);
              if (user) {
                return {
                  uid: user.uid,
                  name: user.name,
                  image: user.image,
                };
              }
              return null;
            })
          );
          usersData[task.id] = users.filter(
            (user): user is AppliedUser => user !== null
          );
        }

        // Fetch assigned user for completed tasks
        if (task.status === "completed" && task.assignedTo) {
          const assignedUser = await getUserFromDB(task.assignedTo);
          if (assignedUser) {
            assignedUsersData[task.id] = assignedUser;
          }
        }
      }

      setAppliedUsers(usersData);
      setAssignedUsers(assignedUsersData);
    };

    if (sortedTasks.length > 0) {
      fetchUsers();
    }
  }, [sortedTasks]);

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-primary-100 text-primary-700";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[600px] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">Created Tasks</h3>
      {sortedTasks && sortedTasks.length > 0 ? (
        <div className="space-y-6">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg ${
                task.status === "pending"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="mt-2 space-x-2">
                    <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Reward: {task.reward}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${getStatusColor(
                        task.status
                      )}`}
                    >
                      Status: {task.status}
                    </span>
                  </div>
                </div>
                {task.status !== "accepted" &&
                  task.status !== "expired" &&
                  task.status !== "completed" && (
                    <button
                      onClick={() => onDeleteTask(task.id, task.reward)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  )}
              </div>

              <div className="mt-4">
                {task.status === "completed" ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-700 mb-2">
                      Task Completed By:
                    </p>
                    {assignedUsers[task.id] && (
                      <div className="flex items-center space-x-3">
                        <Link href={`/profile/${assignedUsers[task.id].uid}`}>
                          <Image
                            src={
                              assignedUsers[task.id].image ||
                              "/default-avatar.png"
                            }
                            alt={assignedUsers[task.id].name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <span className="font-medium text-green-800">
                            {assignedUsers[task.id].name}
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Applied People:
                    </p>
                    {appliedUsers[task.id]?.length > 0 ? (
                      <div className="space-y-3">
                        {appliedUsers[task.id].map((appliedUser) => (
                          <div
                            key={appliedUser.uid}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <Link href={`/profile/${appliedUser.uid}`}>
                                <Image
                                  src={
                                    appliedUser.image || "/default-avatar.png"
                                  }
                                  alt={appliedUser.name}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                                <span className="font-medium">
                                  {appliedUser.name}
                                </span>
                              </Link>
                            </div>
                            {task.status !== "accepted" && (
                              <button
                                onClick={() =>
                                  onAcceptUser(task.id, appliedUser.uid)
                                }
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                              >
                                <FaCheck className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No applications yet
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Show creation date */}
              {task.createdAt && (
                <div className="mt-3 text-xs text-gray-500">
                  Created: {task.createdAt.toLocaleString().substring(0, 10)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      )}
    </div>
  );
};

export default TaskSection;
