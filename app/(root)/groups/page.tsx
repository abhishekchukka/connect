"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthProvider";
import CreateGroupForm from "@/components/goups/createGroupForm";
import GroupCard from "@/components/goups/GroupCard";
import { useRouter } from "next/navigation";
import { useGroups } from "@/lib/context/GroupContext";
import LoginPrompt from "@/components/ui/loginBanner";

export default function ActiveGroups() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { groups, getGroups } = useGroups();
  const {
    filteredGroups,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    resetFilters,
    toggleJoinGroup,
    deleteGroup,
  } = useGroups();

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
    // Initial fetch
    getGroups();

    // Set up periodic refresh every 3 seconds
    const intervalId = setInterval(() => {
      getGroups();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [getGroups, showCreateForm]); // Added getGroups to dependency array

  if (!user) {
    return <LoginPrompt />;
  }

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
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <Button variant="ghost" onClick={resetFilters}>
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
              userId={user?.uid}
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
          onClose={() => {
            setShowCreateForm(false);
          }}
          fetch={() => {}}
        />
      )}
    </div>
  );
}
