import { useAuth } from "@/lib/context/AuthProvider";
import { db } from "@/lib/firebaseConfig";
import { getUserFromDB } from "@/lib/firebaseutils";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

// AssignedTasksSection.tsx
const AssignedTasksSection = ({
  tasks,
  emptyMessage,
}: {
  tasks: any[];
  emptyMessage: string;
}) => {
  const { user } = useAuth();
  const [assignedUsers, setAssignedUsers] = useState<{ [key: string]: any }>(
    {}
  );

  // Filter tasks assigned to current user
  const assignedTasks = tasks.filter(
    (task) => task.assignedTo === user?.uid && task.status === "accepted"
  );

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      const users: { [key: string]: any } = {};
      for (const task of assignedTasks) {
        if (task.creator) {
          const creatorUser = await getUserFromDB(task.creator);
          if (creatorUser) {
            users[task.id] = creatorUser;
          }
        }
      }
      setAssignedUsers(users);
    };

    fetchAssignedUsers();
  }, [tasks]);

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Tasks Assigned to You</h3>
      {assignedTasks.length > 0 ? (
        <div className="space-y-6">
          {assignedTasks.map((task) => {
            const creatorUser = assignedUsers[task.id];
            return (
              <div
                key={task.id}
                className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
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
                          ? "Waiting for Verification"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                {creatorUser && (
                  <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Task Creator:
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={creatorUser.image || "/default-avatar.png"}
                          alt={creatorUser.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="font-medium">{creatorUser.name}</span>
                      </div>

                      {/* Complete Task Button */}
                      {!task.completedByUser && (
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <FaCheck className="w-4 h-4" />
                          <span>Mark as Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progress:</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={
                          task.completedByUser
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ● Your Work Completed
                      </span>
                      <span>→</span>
                      <span
                        className={
                          task.completedByCreator
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ● Payment Received
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
export default AssignedTasksSection;
