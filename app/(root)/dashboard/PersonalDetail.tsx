"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  Edit,
  Save,
  X,
  Instagram,
  Phone,
  Globe,
  MapPin,
  Briefcase,
} from "lucide-react";

interface PersonalDetailsProps {
  userId: string;
  userData: any;
  onUpdate: () => void;
}

const PersonalDetailsSection = ({
  userId,
  userData,
  onUpdate,
}: PersonalDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({
    phoneNumber: userData?.phoneNumber || "",
    instagramId: userData?.instagramId || "",
    website: userData?.website || "",
    location: userData?.location || "",
    bio: userData?.bio || "",
    occupation: userData?.occupation || "",
  });

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setPersonalDetails({
        phoneNumber: userData.phoneNumber || "",
        instagramId: userData.instagramId || "",
        website: userData.website || "",
        location: userData.location || "",
        bio: userData.bio || "",
        occupation: userData.occupation || "",
      });
    }
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        phoneNumber: personalDetails.phoneNumber,
        instagramId: personalDetails.instagramId,
        website: personalDetails.website,
        location: personalDetails.location,
        bio: personalDetails.bio,
        occupation: personalDetails.occupation,
      });

      toast.success("Personal details updated successfully");
      setIsEditing(false);
      onUpdate(); // Trigger parent component to refresh data
    } catch (error) {
      console.error("Error updating personal details:", error);
      toast.error("Failed to update personal details");
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setPersonalDetails({
      phoneNumber: userData?.phoneNumber || "",
      instagramId: userData?.instagramId || "",
      website: userData?.website || "",
      location: userData?.location || "",
      bio: userData?.bio || "",
      occupation: userData?.occupation || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Personal Details</h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              value={personalDetails.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded-md h-24"
              placeholder="Tell us about yourself"
            />
          ) : (
            <p className="text-gray-600">
              {personalDetails.bio || "No bio added yet"}
            </p>
          )}
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>Occupation</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              name="occupation"
              value={personalDetails.occupation}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Your occupation"
            />
          ) : (
            <p className="text-gray-600">
              {personalDetails.occupation || "No occupation added yet"}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Location</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              name="location"
              value={personalDetails.location}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Your location"
            />
          ) : (
            <p className="text-gray-600">
              {personalDetails.location || "No location added yet"}
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-3">Contact Information</h4>

          <div className="space-y-3">
            {/* Phone Number */}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={personalDetails.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Your phone number"
                />
              ) : (
                <span className="text-gray-600">
                  {personalDetails.phoneNumber || "No phone number added"}
                </span>
              )}
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-gray-500" />
              {isEditing ? (
                <input
                  type="text"
                  name="instagramId"
                  value={personalDetails.instagramId}
                  onChange={handleChange}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Your Instagram ID"
                />
              ) : personalDetails.instagramId ? (
                <a
                  href={`https://instagram.com/${personalDetails.instagramId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  @{personalDetails.instagramId}
                </a>
              ) : (
                <span className="text-gray-600">No Instagram ID added</span>
              )}
            </div>

            {/* Website */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={personalDetails.website}
                  onChange={handleChange}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Your website URL"
                />
              ) : personalDetails.website ? (
                <a
                  href={personalDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {personalDetails.website}
                </a>
              ) : (
                <span className="text-gray-600">No website added</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;
