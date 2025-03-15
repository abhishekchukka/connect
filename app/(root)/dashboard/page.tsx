"use client";
import { useAuth } from "@/lib/context/AuthProvider";
import { useGroups } from "@/lib/context/GroupContext";
import { useTasks } from "@/lib/context/TaskContext";
import { getUserFromDB } from "@/lib/firebaseutils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FaUsers,
  FaTasks,
  FaStar,
  FaTrash,
  FaCheck,
  FaClipboardList,
} from "react-icons/fa";
import { toast } from "sonner";
import RunningTasksSection from "./RunningTasksSection";
import AssignedTasksSection from "./AssignedTasks";

// Stats Card Component
interface AppliedUser {
  uid: string;
  name: string;
  image: string;
}

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
  const { user } = useAuth();
  // console.log(appliedUsers);
  useEffect(() => {
    const fetchAppliedUsers = async () => {
      const usersData: { [key: string]: AppliedUser[] } = {};

      for (const task of tasks) {
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
      }
      setAppliedUsers(usersData);
    };
    fetchAppliedUsers();
  }, [tasks]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Created Tasks</h3>
      {tasks && tasks.length > 0 ? (
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="mt-2 space-x-2">
                    <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Reward: {task.reward}
                    </span>
                    <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Status: {task.status}
                    </span>
                  </div>
                </div>
                {task.status !== "accepted" ||
                  task.status !== "expired" ||
                  (task.status !== "completed" && (
                    <button
                      onClick={() => onDeleteTask(task.id, task.reward)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  ))}
              </div>

              <div className="mt-4">
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
                          <Image
                            src={appliedUser.image || "/default-avatar.png"}
                            alt={appliedUser.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <span className="font-medium">
                            {appliedUser.name}
                          </span>
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
                  <p className="text-gray-500 text-sm">No applications yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      )}
    </div>
  );
};
const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <div className="bg-white p-6 rounded-full h-32 w-32 flex flex-col items-center justify-center shadow-lg">
    <div className="text-primary-600 text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Activity Section Component with People List
const ActivitySection = ({
  title,
  items,
  emptyMessage,
  showPeople = false,
}: {
  title: string;
  items: any[];
  emptyMessage: string;
  showPeople?: boolean;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {items && items.length > 0 ? (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{item.title || item.name}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              {item.status && (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              )}
            </div>
            {showPeople && item.people && item.people.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  People:
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.people.map((person: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                    >
                      {person}
                    </span>
                  ))}
                </div>
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

const DashboardPage = () => {
  const { user, userData } = useAuth();
  const { groups } = useGroups();
  const router = useRouter();
  const { tasks, acceptTask, deleteTask, refreshTasks } = useTasks();
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [createdTasks, setCreatedTasks] = useState<any[]>([]);
  const [appliedUsers, setAppliedUsers] = useState<{
    [key: string]: AppliedUser[];
  }>({});

  // Fetch applied users data
  const fetchAppliedUsers = useCallback(async () => {
    const usersData: { [key: string]: AppliedUser[] } = {};
    for (const task of tasks) {
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
    }
    setAppliedUsers(usersData);
  }, [tasks]);

  // Update user groups
  const updateUserGroups = useCallback(() => {
    if (userData && groups) {
      const userCreatedGroups = groups
        .filter((group) => userData.createdGroups.includes(group.id))
        .map((group) => ({
          ...group,
          people: group.joinedUserNames || [],
        }));
      setUserGroups(userCreatedGroups);
    }
  }, [userData, groups]);

  // Update user tasks
  const updateUserTasks = useCallback(() => {
    if (userData && tasks) {
      // Set completed tasks
      const completedTasks = tasks.filter((task) =>
        userData.completedTasks.includes(task.id)
      );
      setUserTasks(completedTasks);

      // Set created tasks with applied people
      const userCreatedTasks = tasks
        .filter((task) => task.creator === userData.uid)
        .map((task) => ({
          ...task,
          people: task.appliedPeople || [],
        }));
      setCreatedTasks(userCreatedTasks);
    }
  }, [userData, tasks]);

  // Combined update function
  const updateDashboardData = useCallback(async () => {
    await refreshTasks(); // Refresh tasks first
    await fetchAppliedUsers();
    updateUserGroups();
    updateUserTasks();
  }, [refreshTasks, fetchAppliedUsers, updateUserGroups, updateUserTasks]);

  // Initial data load
  useEffect(() => {
    updateDashboardData();
  }, [updateDashboardData]);

  // Set up polling interval
  useEffect(() => {
    // Only set up polling if user is authenticated
    if (!user || !userData) return;

    const intervalId = setInterval(() => {
      updateDashboardData();
    }, 3000); // Poll every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [user, userData, updateDashboardData]);

  const handleAcceptUser = async (taskId: string, userId: string) => {
    try {
      await acceptTask(taskId, userId);
      toast.success("User accepted for the task!");
      // Immediately refresh data after accepting user
      await updateDashboardData();
    } catch (error) {
      toast.error("Failed to accept user");
    }
  };

  const handleDeleteTask = async (taskId: string, reward: string) => {
    try {
      await deleteTask(taskId, reward);
      toast.success("Task deleted successfully!");
      // Immediately refresh data after deleting task
      await updateDashboardData();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  if (!userData || !user) {
    router.push("/");
    return <div className="text-center py-10">requires Login...</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <Image
                src={userData.image || "/default-avatar.png"}
                alt={userData.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold">{userData.name}</h2>
            <p className="text-gray-600">{userData.email}</p>
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-primary-700 font-medium">Wallet Balance</p>
              <p className="text-2xl font-bold text-primary-800">
                {userData.wallet}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="col-span-2 flex justify-center items-center gap-8 flex-wrap">
          <StatCard icon={<FaStar />} value={userData.rating} label="Rating" />
          <StatCard
            icon={<FaUsers />}
            value={userData.createdGroups.length}
            label="Groups"
          />
          <StatCard
            icon={<FaTasks />}
            value={userData.completedTasks.length}
            label="Completed"
          />
          <StatCard
            icon={<FaClipboardList />}
            value={createdTasks.length}
            label="Created Tasks"
          />
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActivitySection
          title="My Groups"
          items={userGroups}
          emptyMessage="No groups created yet"
          showPeople={true}
        />
        <TaskSection
          tasks={createdTasks}
          emptyMessage="No tasks created yet"
          onAcceptUser={handleAcceptUser}
          onDeleteTask={handleDeleteTask}
          userData={userData}
        />
        <ActivitySection
          title="Offered Services"
          items={userData.offeredServices}
          emptyMessage="No services offered yet"
        />
        <RunningTasksSection tasks={tasks} emptyMessage="No running tasks" />
        <AssignedTasksSection
          tasks={tasks}
          emptyMessage="No tasks are assigned to you"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Joined Groups</h3>
            {groups && userData.joinedGroups.length > 0 ? (
              <div className="space-y-4">
                {groups
                  .filter((group) => userData.joinedGroups.includes(group.id))
                  .map((group) => (
                    <div key={group.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{group.name}</h4>
                          <p className="text-sm text-gray-600">
                            {group.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            group.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {group.status}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          Members: {group.joinedUserNames?.length || 0}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No groups joined yet
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Applied Tasks</h3>
            {tasks ? (
              <div className="space-y-4">
                {tasks
                  .filter(
                    (task) =>
                      task.appliedPeople?.includes(userData.uid) &&
                      task.status !== "completed" &&
                      task.status !== "accepted"
                  )
                  .map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {task.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          Reward: {task.reward}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No tasks applied to yet
              </p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Completed Tasks</h3>
          {tasks && userData.completedTasks.length > 0 ? (
            <div className="space-y-4">
              {tasks
                .filter((task) => userData.completedTasks.includes(task.id))
                .map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600">
                          {task.description}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Completed
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Reward: {task.reward}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Earned
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No completed tasks yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
