"use client";
import { useState } from "react";
// Adjust the path based on your setup
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/context/AuthProvider";
import { stat } from "fs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateGroupForm({
  onClose,
  fetch,
}: {
  onClose: () => void;
  fetch: (x: any) => void;
}) {
  const [title, setTitle] = useState("");
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  // const [status, setStatus] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const options = [
    "sports",
    "development",
    "fun",
    "interaction",
    "social",
    "learning",
    "exam-prep",
  ];
  const router = useRouter();

  // 📌 Create a new group in Firestore
  const createGroup = async () => {
    if (!title || !description || !category || !location || !maxMembers) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const newGroup = {
        title,
        description,
        category,
        location,
        expiryDate,
        expiryTime,
        maxMembers: parseInt(maxMembers, 10),
        creator: user.uid, // Replace with actual user info
        memberCount: 0, // Default count
        joinedPeople: [], // Empty array initially
        joined: false,
        status: "active",
      };

      const docRef = await addDoc(collection(db, "groups"), newGroup);
      console.log("Group created with ID:", docRef.id);
      toast("Group Created Successfully!");

      // Reset Form
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setExpiryDate("");
      setExpiryTime("");
      setMaxMembers("");
      // router.push("/groups");
      fetch((x) => !x);
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error creating group:", error);
      toast("Failed to create group. Try again!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>

        <label htmlFor="group">Group Title:</label>
        <input
          id="group"
          type="text"
          placeholder="Enter Group Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <label>Description:</label>
        <textarea
          placeholder="Enter group description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
          rows={3}
        ></textarea>

        <label>Category:</label>
        <select
          className="w-full p-2 border rounded-md mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {options.map((option, _) => (
            <option key={_} value={option}>
              {option}
            </option>
          ))}
        </select>

        {/* <input
          type="text"
          placeholder="Enter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        /> */}

        <label>Location:</label>
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <label>Expiry Date:</label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <label>Expiry Time:</label>
        <input
          type="time"
          value={expiryTime}
          onChange={(e) => setExpiryTime(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <label>Maximum Participants:</label>
        <input
          type="number"
          placeholder="Max members"
          value={maxMembers}
          onChange={(e) => setMaxMembers(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={createGroup}>Create</Button>
        </div>
      </div>
    </div>
  );
}
