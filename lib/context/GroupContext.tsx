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
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { group } from "@/lib/type";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthProvider";

interface GroupContextType {
  groups: group[];
  loading: boolean;
  search: string;
  filterCategory: string;
  setSearch: (search: string) => void;
  setFilterCategory: (category: string) => void;
  filteredGroups: group[];
  resetFilters: () => void;
  toggleJoinGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, updateData: Partial<group>) => Promise<void>;
  refreshGroups: () => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [present, setPresent] = useState(false);
  const { user, updateUser, userData } = useAuth();
  // console.log("userData", userData);
  const userId = user?.uid;

  const getGroups = async () => {
    try {
      const now = new Date();
      const groupsSnapshot = await getDocs(collection(db, "groups"));

      const groupsWithDetails = await Promise.all(
        groupsSnapshot.docs.map(async (groupDoc) => {
          const groupData = groupDoc.data() as Omit<group, "id">;
          const creatorUid = groupData.creator;
          const groupExpiryDate = new Date(
            groupData.expiryDate + " " + groupData.expiryTime
          );

          // Fetch creator's data
          const creatorDoc = await getDoc(doc(db, "users", creatorUid));
          const creatorName = creatorDoc.exists()
            ? creatorDoc.data().name || "Unknown User"
            : "Unknown User";

          // Fetch joined users' names
          const joinedUserNames = await Promise.all(
            groupData.joinedPeople.map(async (userId) => {
              const userDoc = await getDoc(doc(db, "users", userId));
              return userDoc.exists() ? userDoc.data().name : "Unknown User";
            })
          );

          // Update expired groups
          if (groupExpiryDate < now && groupData.status !== "expired") {
            await updateDoc(doc(db, "groups", groupDoc.id), {
              status: "expired",
            });
          }

          return {
            id: groupDoc.id,
            ...groupData,
            creatorName,
            joinedUserNames,
            joined: groupData.joinedPeople.includes(userId),
          };
        })
      );

      setGroups(groupsWithDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setLoading(false);
    }
  };

  const toggleJoinGroup = async (groupId: string) => {
    if (!userId) {
      alert("You need to log in to join groups.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) return;

      const groupData = groupSnap.data();
      let updatedJoinedPeople = [...groupData.joinedPeople];
      let joinedGroups = [...userData?.joinedGroups];
      console.log("joinedGroups", joinedGroups);

      if (
        updatedJoinedPeople.includes(userId) ||
        joinedGroups.includes(groupId)
      ) {
        setPresent(true);
        updatedJoinedPeople = updatedJoinedPeople.filter((id) => id !== userId);
        joinedGroups = joinedGroups.filter((id) => id !== groupId);
      } else {
        setPresent(false);
        if (groupData.memberCount >= groupData.maxMembers) {
          alert("Group is full!");
          return;
        }
        updatedJoinedPeople.push(userId);
        joinedGroups.push(groupId);
      }

      await updateDoc(groupRef, {
        joinedPeople: updatedJoinedPeople,
        memberCount: updatedJoinedPeople.length,
      });
      await updateUser({ joinedGroups: joinedGroups });

      refreshGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!userId) {
      alert("You need to log in to delete a group.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) return;

      const groupData = groupSnap.data();
      if (groupData.creator !== userId) {
        toast("Only the group creator can delete this group.");
        return;
      }

      toast.custom((t) => (
        <div className="rounded-lg shadow-lg bg-white p-4 max-w-sm">
          <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
          <p className="text-sm text-gray-500 mt-2">
            This will permanently delete the group.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await deleteDoc(groupRef);
                  toast.success("Group deleted successfully.");
                  refreshGroups();
                } catch (error) {
                  toast.error("Failed to delete the group.");
                }
              }}
            >
              Yes, delete
            </button>
            <button
              className="border px-4 py-2 rounded"
              onClick={() => toast.dismiss(t)}
            >
              Cancel
            </button>
          </div>
        </div>
      ));
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };
  const updateGroup = async (groupId: string, updateData: Partial<group>) => {
    if (!userId) {
      toast.error("You need to be logged in to update a group.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        toast.error("Group not found.");
        return;
      }

      const groupData = groupSnap.data();

      // Check if the current user is the creator of the group
      if (groupData.creator !== userId) {
        toast.error("Only the group creator can update this group.");
        return;
      }

      // Remove any undefined or null values from updateData
      const cleanedUpdateData = Object.entries(updateData).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // Update the document
      await updateDoc(groupRef, cleanedUpdateData);

      toast.success("Group updated successfully!");
      refreshGroups(); // Refresh the groups list to show the updates
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update the group.");
    }
  };

  const refreshGroups = () => {
    setFetchTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (user) {
      getGroups();
    }
  }, [user, fetchTrigger]);

  const filteredGroups = groups.filter(
    (group) =>
      group.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterCategory ? group.category === filterCategory : true)
  );

  const resetFilters = () => {
    setSearch("");
    setFilterCategory("");
  };

  const value = {
    groups,
    loading,
    search,
    filterCategory,
    setSearch,
    setFilterCategory,
    filteredGroups,
    resetFilters,
    toggleJoinGroup,
    deleteGroup,
    refreshGroups,
    getGroups,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
};
