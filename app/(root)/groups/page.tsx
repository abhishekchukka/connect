"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { PlusCircle, Search, X, Group } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthProvider"; // Assuming you have an AuthContext for user authentication
import CreateGroupForm from "@/components/goups/createGroupForm";
import GroupCard from "@/components/goups/GroupCard";
import { useRouter } from "next/navigation";
// import { group } from "@/lib/type";
import { toast } from "sonner";
import { group } from "@/lib/type";

export default function ActiveGroups() {
  // console.log(groups);
  const [groups, setGroups] = useState<group[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth(); // Get logged-in user details
  const [fetch, setfetchData] = useState(false);
  const userId = user?.uid;
  const router = useRouter();
  const options = [
    "sports",
    "development",
    "fun",
    "interaction",
    "social",
    "learning",
    "exam-prep",
  ];
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
    getGroups();
  }, [fetch]);

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

          // Fetch creator's data from users collection
          const creatorDoc = await getDoc(doc(db, "users", creatorUid));
          const creatorName = creatorDoc.exists()
            ? creatorDoc.data().name || "Unknown User"
            : "Unknown User";

          // Fetch names of joined users
          const joinedUserNames = await Promise.all(
            groupData.joinedPeople.map(async (userId) => {
              const userDoc = await getDoc(doc(db, "users", userId));
              return userDoc.exists() ? userDoc.data().name : "Unknown User";
            })
          );
          if (groupExpiryDate < now && groupData.status !== "expired") {
            await updateDoc(doc(db, "groups", groupDoc.id), {
              status: "expired",
            });
          }

          return {
            id: groupDoc.id,
            ...groupData,
            creatorName,
            joinedUserNames, // Store fetched names
            joined: groupData.joinedPeople.includes(userId),
          };
        })
      );
      const activeGroups = groupsWithDetails.filter(
        (group) => group.status !== "expired"
      );
      setGroups(activeGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // ✅ Function to Join/Unjoin a Group
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

      if (updatedJoinedPeople.includes(userId)) {
        // Unjoin the group
        updatedJoinedPeople = updatedJoinedPeople.filter((id) => id !== userId);
      } else {
        // Join the group
        if (groupData.memberCount >= groupData.maxMembers) {
          alert("Group is full!");
          return;
        }
        updatedJoinedPeople.push(userId);
      }

      await updateDoc(groupRef, {
        joinedPeople: updatedJoinedPeople,
        memberCount: updatedJoinedPeople.length,
      });

      getGroups(); // Refresh groups
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  // ❌ Function to Delete a Group (Only for Creator)
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
            <Button
              variant="destructive"
              onClick={async () => {
                toast.dismiss(t); // Dismiss the current toast
                try {
                  await deleteDoc(groupRef); // Delete the document
                  // Refresh groups
                  toast.success("Group deleted successfully.");
                  setfetchData((x) => !x);
                } catch (error) {
                  toast.error("Failed to delete the group.");
                }
              }}
            >
              Yes, delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.dismiss(t); // Dismiss the current toast
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ));
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterCategory ? group.category === filterCategory : true)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔍 Search & Filter Section */}
      <div className="container mx-auto px-4 py-6 bg-white shadow-md rounded-md flex flex-wrap items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pl-10 border rounded-md focus:ring-2 focus:ring-blue-400"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-3 border rounded-md"
        >
          <option value="">All Categories</option>
          {options.map((option, _) => (
            <option key={_} value={option}>
              {option}
            </option>
          ))}
          {/* <option value="Sports">Sports</option>
          <option value="Web Development">Web Development</option>
          <option value="Artificial Intelligence">AI</option>
          <option value="Freelancing">Freelancing</option>
          <option value="Cybersecurity">Cybersecurity</option> */}
        </select>

        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setFilterCategory("");
          }}
        >
          <X size={16} className="mr-2" /> Reset Filters
        </Button>
      </div>

      {/* 🏷 Groups Display */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <GroupCard
              group={group}
              key={group.id}
              onJoinToggle={toggleJoinGroup}
              onDelete={deleteGroup}
              userId={userId}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 col-span-3">
            No groups found.
          </div>
        )}
      </div>

      {/* ➕ Floating Button to Create Group */}
      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
        onClick={() => setShowCreateForm(true)}
      >
        <PlusCircle size={24} />
      </button>

      {/* ➕ Create Group Form Modal */}
      {showCreateForm && (
        <CreateGroupForm
          onClose={() => setShowCreateForm(false)}
          fetch={setfetchData}
        />
      )}
    </div>
  );
}
