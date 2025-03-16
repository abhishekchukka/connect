"use client";

import HeroSection from "@/components/HeroSection";
import Section from "@/components/home/Section";
// import { useAuth } from "@/lib/AuthProvider";
import { useGroups } from "@/lib/context/GroupContext";
import { PlusCircle } from "lucide-react";

export default function Home() {
  const { groups, toggleJoinGroup } = useGroups();
  // Initialize as an empty array
  // const { user } = useAuth();
  // const userId = user?.uid;
  // Fetch groups from Firestore

  // Fetch groups when the component mounts

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
