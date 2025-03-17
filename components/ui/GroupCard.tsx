"use client";

import { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUserCircle,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { getUserFromDB } from "@/lib/firebaseutils";

interface GroupMember {
  id: string;
  name: string;
  image?: string;
}

interface GroupCardProps {
  group: any;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Check for both possible field names (joinedUsers or joinedPeople)
        const memberIds = group.joinedUsers || group.joinedPeople || [];

        if (memberIds.length > 0) {
          const fetchedMembers = await Promise.all(
            memberIds.map(async (userId: string) => {
              const userData = await getUserFromDB(userId);
              if (userData) {
                return {
                  id: userData.id,
                  name: userData.name,
                  image: userData.image,
                };
              }
              return null;
            })
          );

          // Filter out null values and set the members
          setMembers(
            fetchedMembers.filter(
              (member): member is GroupMember => member !== null
            )
          );
        }
      } catch (error) {
        console.error("Error fetching group members:", error);
      } finally {
        setLoading(false);
      }
    };

    if (group) {
      fetchMembers();
    }
  }, [group]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{group.name}</h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {group.description}
          </p>

          {/* Group Details */}
          <div className="mt-2 space-y-1">
            {group.location && (
              <div className="flex items-center text-xs text-gray-600">
                <FaMapMarkerAlt className="mr-1 text-gray-400" size={12} />
                <span>{group.location}</span>
              </div>
            )}

            {group.expiryTime && (
              <div className="flex items-center text-xs text-gray-600">
                <FaClock className="mr-1 text-gray-400" size={12} />
                <span>{group.expiryTime}</span>
              </div>
            )}

            {group.expiryDate && (
              <div className="flex items-center text-xs text-gray-600">
                <FaCalendarAlt className="mr-1 text-gray-400" size={12} />
                <span>{group.expiryDate}</span>
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

      {/* Group Members */}
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-700 mb-2">
          Members: {loading ? "Loading..." : members.length}
        </p>

        {!loading && members.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.id}`}
                className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-colors"
              >
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <FaUserCircle size={16} className="text-gray-400" />
                )}
                <span>{member.name}</span>
              </Link>
            ))}
          </div>
        ) : !loading && members.length === 0 ? (
          <p className="text-xs text-gray-500">No members yet</p>
        ) : (
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse delay-150"></div>
            <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse delay-300"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
