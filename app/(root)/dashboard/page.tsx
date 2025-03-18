"use client";
import { useAuth } from "@/lib/context/AuthProvider";
import { useGroups } from "@/lib/context/GroupContext";
import { Suspense } from "react";
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
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUserCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import RunningTasksSection from "./RunningTasksSection";
import AssignedTasksSection from "./AssignedTasks";
import LoginPrompt from "@/components/ui/loginBanner";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import TaskSection from "./TaskSection";
import LoadingCard from "./LoadingCard";
import PersonalDetailsSection from "./PersonalDetail";
import GroupCard from "@/components/ui/GroupCard";
import GridLoader from "react-spinners/GridLoader";
// Stats Card Component
const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <div className="bg-white p-4 rounded-lg h-24 sm:h-28 w-full flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
    <div className="text-primary-600 text-xl mb-1">{icon}</div>
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

// Enhanced Group Card Component
// const GroupCard = ({
//   group,
//   groupMembers,
// }: {
//   group: any;
//   groupMembers: any[];
// }) => {
//   return (
//     <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//       <div className="flex justify-between items-start gap-2">
//         <div className="flex-1 min-w-0">
//           <h4 className="font-medium text-sm truncate">{group.name}</h4>
//           <p className="text-xs text-gray-600 line-clamp-2">
//             {group.description}
//           </p>

//           {/* Group Details */}
//           <div className="mt-2 space-y-1">
//             {group.location && (
//               <div className="flex items-center text-xs text-gray-600">
//                 <FaMapMarkerAlt className="mr-1 text-gray-400" size={12} />
//                 <span>{group.location}</span>
//               </div>
//             )}

//             {group.expiryTime && (
//               <div className="flex items-center text-xs text-gray-600">
//                 <FaClock className="mr-1 text-gray-400" size={12} />
//                 <span>{group.expiryTime}</span>
//               </div>
//             )}

//             {group.expiryDate && (
//               <div className="flex items-center text-xs text-gray-600">
//                 <FaCalendarAlt className="mr-1 text-gray-400" size={12} />
//                 <span>{group.expiryDate}</span>
//               </div>
//             )}

//             {group.category && (
//               <div className="mt-1">
//                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
//                   {group.category}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//         <span
//           className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
//             group.status === "active"
//               ? "bg-green-100 text-green-700"
//               : "bg-yellow-100 text-yellow-700"
//           }`}
//         >
//           {group.status}
//         </span>
//       </div>

//       {/* Group Members */}
//       {groupMembers && groupMembers.length > 0 && (
//         <div className="mt-3">
//           <p className="text-xs font-medium text-gray-700 mb-2">Members:</p>
//           <div className="flex flex-wrap gap-2">
//             {groupMembers.map((member) => (
//               <Link
//                 key={member.id}
//                 href={`/profile/${member}`}
//                 className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-colors"
//               >
//                 {member.image ? (
//                   <Image
//                     src={member.image}
//                     alt={member.name}
//                     width={16}
//                     height={16}
//                     className="rounded-full"
//                   />
//                 ) : (
//                   <FaUserCircle size={16} className="text-gray-400" />
//                 )}
//                 <span>{member.name}</span>
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// Task Card Component with Creator Info
const TaskCard = ({ task, creatorInfo }: { task: any; creatorInfo: any }) => {
  return (
    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>

          {/* Task Creator */}
          {task.creator && creatorInfo && (
            <div className="mt-2">
              <Link
                href={`/profile/${task.creator}`}
                className="inline-flex items-center text-xs text-primary-600 hover:underline"
              >
                {creatorInfo.image ? (
                  <Image
                    src={creatorInfo.image}
                    alt={creatorInfo.name}
                    width={16}
                    height={16}
                    className="rounded-full mr-1"
                  />
                ) : (
                  <FaUserCircle className="mr-1" size={12} />
                )}
                <span>Created by: {creatorInfo.name}</span>
              </Link>
            </div>
          )}
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
            task.status === "completed"
              ? "bg-green-100 text-green-700"
              : task.status === "accepted"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {task.status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
          Reward: ₹{task.reward}
        </span>
        {task.status === "completed" && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Earned
          </span>
        )}
      </div>
    </div>
  );
};

// Enhanced Activity Section Component with People List
const ActivitySection = ({
  title,
  items,
  emptyMessage,
  showPeople = false,
  groupMembers = {},
  creatorInfo = {},
}: {
  title: string;
  items: any[];
  emptyMessage: string;
  showPeople?: boolean;
  groupMembers?: { [key: string]: any[] };
  creatorInfo?: { [key: string]: any };
}) => (
  <div className="bg-white p-4 rounded-lg shadow-md h-full">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {items && items.length > 0 ? (
      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
        {items.map((item) => (
          <div key={item.id}>
            {title === "My Groups" ? (
              <GroupCard group={item} />
            ) : title === "Applied Tasks" || title === "Completed Tasks" ? (
              <TaskCard task={item} creatorInfo={creatorInfo[item.creator]} />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {item.title || item.name}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  {item.status && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
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
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      People:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.people.map((person: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs"
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center text-sm">{emptyMessage}</p>
      </div>
    )}
  </div>
);

const DashboardPage = () => {
  const { user, userData, refreshUser, loading } = useAuth();
  const { groups } = useGroups();
  const { tasks, acceptTask, deleteTask, refreshTasks } = useTasks();
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [createdTasks, setCreatedTasks] = useState<any[]>([]);
  const [appliedUsers, setAppliedUsers] = useState<{
    [key: string]: AppliedUser[];
  }>({});
  const [userWallet, setUserWallet] = useState(userData?.wallet || 0);
  const [groupMembers, setGroupMembers] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [taskCreators, setTaskCreators] = useState<{ [key: string]: any }>({});
  const [appliedTasks, setAppliedTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const router = useRouter();

  // Fetch applied users data only for tasks created by the current user
  const fetchAppliedUsers = useCallback(async () => {
    const usersData: { [key: string]: AppliedUser[] } = {};
    const relevantTasks = tasks.filter((task) => task.creator === user?.uid);

    for (const task of relevantTasks) {
      if (task.appliedPeople?.length > 0) {
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
  }, [tasks, user?.uid]);

  // Update user groups - simplified
  const updateUserGroups = useCallback(() => {
    if (userData && groups) {
      const userCreatedGroups = groups.filter((group) =>
        userData.createdGroups.includes(group.id)
      );
      setUserGroups(userCreatedGroups);

      // Fetch group members for each group
      fetchGroupMembers(userCreatedGroups);
    }
  }, [userData, groups]);

  // Fetch group members
  const fetchGroupMembers = async (groups: any[]) => {
    const membersData: { [key: string]: any[] } = {};

    for (const group of groups) {
      if (group.joinedUsers && group.joinedUsers.length > 0) {
        const members = await Promise.all(
          group.joinedUsers.map(async (userId: string) => {
            const user = await getUserFromDB(userId);
            if (user) {
              return {
                id: userId,
                name: user.name,
                image: user.image,
              };
            }
            return null;
          })
        );
        membersData[group.id] = members.filter((member) => member !== null);
      }
    }

    setGroupMembers(membersData);
  };

  // Fetch task creators
  const fetchTaskCreators = useCallback(async (tasksList: any[]) => {
    const creatorsData: { [key: string]: any } = {};
    const uniqueCreatorIds = [
      ...new Set(tasksList.map((task) => task.creator)),
    ];

    for (const creatorId of uniqueCreatorIds) {
      if (creatorId) {
        const creatorData = await getUserFromDB(creatorId);
        if (creatorData) {
          creatorsData[creatorId] = {
            id: creatorId,
            name: creatorData.name,
            image: creatorData.image,
          };
        }
      }
    }

    setTaskCreators(creatorsData);
  }, []);

  // Update applied and completed tasks
  const updateUserTasks = useCallback(() => {
    if (userData && tasks) {
      // Get tasks the user has applied to
      const userAppliedTasks = tasks.filter(
        (task) =>
          task.appliedPeople?.includes(userData.uid) &&
          task.status !== "completed" &&
          task.status !== "accepted"
      );
      setAppliedTasks(userAppliedTasks);

      // Get completed tasks
      const userCompletedTasks = tasks.filter((task) =>
        userData.completedTasks?.includes(task.id)
      );
      setCompletedTasks(userCompletedTasks);

      // Fetch creators for these tasks
      fetchTaskCreators([...userAppliedTasks, ...userCompletedTasks]);
    }
  }, [userData, tasks, fetchTaskCreators]);

  const updateWalletOnly = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const newWalletAmount = userSnap.data().wallet;
        setUserWallet(newWalletAmount);

        // Update userData wallet without full refresh
        if (userData) {
          userData.wallet = newWalletAmount;
        }
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
    }
  }, [user?.uid, userData]);

  // Update created tasks - simplified
  const updateCreatedTasks = useCallback(() => {
    if (userData && tasks) {
      const userCreatedTasks = tasks.filter(
        (task) => task.creator === userData.uid
      );
      setCreatedTasks(userCreatedTasks);
    }
  }, [userData, tasks]);

  const updateDashboardData = useCallback(async () => {
    const updates = [refreshTasks(), fetchAppliedUsers(), updateWalletOnly()];

    // Run updates in parallel
    await Promise.all(updates);

    // Update local states that don't require async operations
    updateUserGroups();
    updateCreatedTasks();
    updateUserTasks();
  }, [
    refreshTasks,
    fetchAppliedUsers,
    updateWalletOnly,
    updateUserGroups,
    updateCreatedTasks,
    updateUserTasks,
  ]);

  // Set up polling interval with reduced frequency
  useEffect(() => {
    // Only set up polling if user is authenticated
    if (!user || !userData) return;

    // Initial data load
    updateDashboardData();

    const intervalId = setInterval(() => {
      updateDashboardData();
    }, 5000); // Poll every 5 seconds instead of 3

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [user, userData, updateDashboardData]);

  useEffect(() => {
    const handleWalletUpdate = () => {
      updateWalletOnly();
    };

    window.addEventListener("walletUpdated", handleWalletUpdate);
    return () =>
      window.removeEventListener("walletUpdated", handleWalletUpdate);
  }, [updateWalletOnly]);

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
  if (loading) {
    return (
      <div className="absolute bg-white inset-0 flex justify-center items-center">
        <GridLoader />
      </div>
    );
  }
  if ((!userData || !user) && !loading) {
    return <LoginPrompt />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <Link href={`/profile/${user.uid}`} className="block group">
              <div className="relative w-32 h-32 mx-auto mb-3 group-hover:ring-2 ring-primary-500 rounded-full transition-all">
                <Image
                  src={userData.image || "/default-avatar.png"}
                  alt={userData.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="128px"
                  priority
                />
              </div>
              <h2 className="text-xl font-bold truncate group-hover:text-primary-600 transition-colors">
                {userData.name}
              </h2>
            </Link>
            <p className="text-sm text-gray-600 truncate">{userData.email}</p>
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <p className="text-primary-700 font-medium text-sm">
                Wallet Balance
              </p>
              <p className="text-xl font-bold text-primary-800">
                ₹{userWallet}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">
              Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<FaStar />}
                value={userData.rating}
                label="Rating"
              />
              <StatCard
                icon={<FaUsers />}
                value={userData.createdGroups.length}
                label="Groups"
              />
              <StatCard
                icon={<FaTasks />}
                value={userData.completedTasks?.length || 0}
                label="Completed"
              />
              <StatCard
                icon={<FaClipboardList />}
                value={createdTasks.length}
                label="Created Tasks"
              />
            </div>
            <div className="mt-4">
              <PersonalDetailsSection
                userId={user.uid}
                userData={userData}
                onUpdate={refreshUser}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense fallback={<LoadingCard />}>
          <ActivitySection
            title="My Groups"
            items={userGroups}
            emptyMessage="No groups created yet"
            showPeople={true}
            groupMembers={groupMembers}
          />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <div className="md:col-span-1">
            <TaskSection
              tasks={createdTasks}
              emptyMessage="No tasks created yet"
              onAcceptUser={handleAcceptUser}
              onDeleteTask={handleDeleteTask}
              userData={userData}
            />
          </div>
        </Suspense>

        <ActivitySection
          title="Offered Services"
          items={userData.offeredServices || []}
          emptyMessage="No services offered yet"
        />

        <Suspense fallback={<LoadingCard />}>
          <RunningTasksSection tasks={tasks} emptyMessage="No running tasks" />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <AssignedTasksSection
            tasks={tasks}
            emptyMessage="No tasks are assigned to you"
          />
        </Suspense>

        <div className="md:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md h-full">
              <h3 className="text-lg font-semibold mb-4">Joined Groups</h3>
              {groups && userData.joinedGroups?.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {groups
                    .filter((group) =>
                      userData.joinedGroups?.includes(group.id)
                    )
                    .map((group) => (
                      <div
                        key={group.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {group.name}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {group.description}
                            </p>

                            {/* Group Details */}
                            <div className="mt-2 space-y-1">
                              {group.location && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <FaMapMarkerAlt
                                    className="mr-1 text-gray-400"
                                    size={12}
                                  />
                                  <span>{group.location}</span>
                                </div>
                              )}

                              {group.meetingTime && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <FaClock
                                    className="mr-1 text-gray-400"
                                    size={12}
                                  />
                                  <span>{group.meetingTime}</span>
                                </div>
                              )}

                              {group.category && (
                                <div className="mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {group.category}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                              group.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {group.status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">
                            Members: {group.joinedUserNames?.length || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-center text-sm">
                    No groups joined yet
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md h-full">
              <h3 className="text-lg font-semibold mb-4">Applied Tasks</h3>
              {appliedTasks.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {appliedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      creatorInfo={taskCreators[task.creator]}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-center text-sm">
                    No tasks applied to yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Completed Tasks</h3>
            {completedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    creatorInfo={taskCreators[task.creator]}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-center text-sm">
                  No completed tasks yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
