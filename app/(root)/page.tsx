"use client";

import HeroSection from "@/components/HeroSection";
import Section from "@/components/home/Section";
import { useAuth } from "@/lib/AuthProvider";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react"; // Add useEffect for fetching on mount
import { toast } from "sonner";

export default function Home() {
  const [groups, setGroups] = useState<any[]>([]); // Initialize as an empty array
  const { user } = useAuth();
  const userId = user?.uid;
  // Fetch groups from Firestore
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

  // Fetch groups when the component mounts
  useEffect(() => {
    getGroups();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-20 space-y-12">
        {/* Display Fetched Groups */}
        <Section
          title="Fetched Groups"
          items={groups} // Pass the fetched groups to the Section component
          buttonText="Join Now"
          buttonHandler={toggleJoinGroup}
          renderInfo={(group) => (
            <p className="text-sm text-gray-500">{group.memberCount} members</p>
          )}
          showMoreHref="/groups"
        />
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Create new"
      >
        <PlusCircle size={24} />
      </button>
    </div>
  );
}
