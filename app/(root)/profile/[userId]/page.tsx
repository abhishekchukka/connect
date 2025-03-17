"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/context/AuthProvider";
import { getUserFromDB } from "@/lib/firebaseutils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Phone,
  Instagram,
  Globe,
  MapPin,
  Briefcase,
  Star,
  Users,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import LoadingCard from "@/app/(root)/dashboard/LoadingCard";

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
  <div className="bg-white p-4 rounded-lg h-24 sm:h-28 w-full flex flex-col items-center justify-center shadow-md">
    <div className="text-primary-600 text-xl mb-1">{icon}</div>
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

// Activity Section Component
const ActivitySection = ({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: any[];
  emptyMessage: string;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-md h-full">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {items && items.length > 0 ? (
      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
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

export default function UserProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [offeredServices, setOfferedServices] = useState<any[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!userId || typeof userId !== "string") {
          router.push("/");
          return;
        }

        const userData = await getUserFromDB(userId);
        if (!userData) {
          router.push("/");
          return;
        }

        setProfileUser(userData);
        setIsCurrentUser(user?.uid === userId);

        // Fetch completed tasks
        if (userData.completedTasks && userData.completedTasks.length > 0) {
          const tasksData = await Promise.all(
            userData.completedTasks.map(async (taskId: string) => {
              const taskDoc = await getDoc(doc(db, "tasks", taskId));
              if (taskDoc.exists()) {
                return { id: taskDoc.id, ...taskDoc.data() };
              }
              return null;
            })
          );
          setCompletedTasks(tasksData.filter((task) => task !== null));
        }

        // Fetch created groups
        if (userData.createdGroups && userData.createdGroups.length > 0) {
          const groupsData = await Promise.all(
            userData.createdGroups.map(async (groupId: string) => {
              const groupDoc = await getDoc(doc(db, "groups", groupId));
              if (groupDoc.exists()) {
                return { id: groupDoc.id, ...groupDoc.data() };
              }
              return null;
            })
          );
          setCreatedGroups(groupsData.filter((group) => group !== null));
        }

        // Set offered services
        if (userData.offeredServices) {
          setOfferedServices(userData.offeredServices);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, router, user?.uid]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingCard />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold">User not found</h2>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-32 relative">
          {isCurrentUser && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => router.push("/profile/edit")}
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="px-4 pb-6 relative">
          {/* Profile Image */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white -mt-16 mx-auto">
            <Image
              src={profileUser.image || "/default-avatar.png"}
              alt={profileUser.name}
              fill
              className="object-cover"
              sizes="128px"
              priority
            />
          </div>

          {/* Profile Info */}
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold">{profileUser.name}</h2>
            <p className="text-gray-600">{profileUser.email}</p>

            {/* Bio */}
            {profileUser.bio && (
              <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
                {profileUser.bio}
              </p>
            )}

            {/* Occupation & Location */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {profileUser.occupation && (
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{profileUser.occupation}</span>
                </div>
              )}

              {profileUser.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profileUser.location}</span>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {profileUser.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-1" />
                  <span>{profileUser.phoneNumber}</span>
                </div>
              )}

              {profileUser.instagramId && (
                <a
                  href={`https://instagram.com/${profileUser.instagramId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <Instagram className="h-4 w-4 mr-1" />
                  <span>@{profileUser.instagramId}</span>
                </a>
              )}

              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <StatCard
              icon={<Star className="h-5 w-5" />}
              value={profileUser.rating}
              label="Rating"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={profileUser.createdGroups?.length || 0}
              label="Groups"
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5" />}
              value={profileUser.completedTasks?.length || 0}
              label="Completed"
            />
            <StatCard
              icon={<ClipboardList className="h-5 w-5" />}
              value={profileUser.createdTasks?.length || 0}
              label="Created"
            />
          </div>
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActivitySection
          title="Created Groups"
          items={createdGroups}
          emptyMessage="No groups created yet"
        />

        <ActivitySection
          title="Completed Tasks"
          items={completedTasks}
          emptyMessage="No completed tasks yet"
        />

        <ActivitySection
          title="Offered Services"
          items={offeredServices}
          emptyMessage="No services offered yet"
        />
      </div>
    </div>
  );
}
