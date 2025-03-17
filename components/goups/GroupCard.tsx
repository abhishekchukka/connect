import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { group } from "@/lib/type";
import { Calendar, Clock, MapPin, Users, Trash2, Info } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserFromDB } from "@/lib/firebaseutils";

interface GroupCardProps {
  group: group;
  onJoinToggle: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  userId?: string;
}

interface GroupMember {
  id: string;
  name: string;
  image?: string;
}

const GroupCard = ({
  group,
  onJoinToggle,
  onDelete,
  userId,
}: GroupCardProps) => {
  const isCreator = userId === group.creator;
  const isFull = group.memberCount >= group.maxMembers;
  const [creatorInfo, setCreatorInfo] = useState<GroupMember | null>(null);
  const [memberInfo, setMemberInfo] = useState<GroupMember[]>([]);

  // Fetch creator info
  useEffect(() => {
    const fetchCreator = async () => {
      if (group.creator) {
        const creator = await getUserFromDB(group.creator);
        if (creator) {
          setCreatorInfo({
            id: creator.id,
            name: creator.name,
            image: creator.image,
          });
        }
      }
    };

    fetchCreator();
  }, [group.creator]);

  // Fetch member info for IDs
  useEffect(() => {
    const fetchMembers = async () => {
      if (group.joinedPeople && group.joinedPeople.length > 0) {
        const members = await Promise.all(
          group.joinedPeople.map(async (memberId: string) => {
            const member = await getUserFromDB(memberId);
            if (member) {
              return {
                id: member.id,
                name: member.name,
                image: member.image,
              };
            }
            return null;
          })
        );

        setMemberInfo(members.filter((m): m is GroupMember => m !== null));
      }
    };

    fetchMembers();
  }, [group.joinedPeople]);

  const isExpired = () => {
    const now = new Date();
    const expiryDateTime = new Date(`${group.expiryDate}T${group.expiryTime}`);
    return now > expiryDateTime;
  };

  const expired = isExpired();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full hover:shadow-xl transition-all duration-300 overflow-hidden border-none shadow-md">
        {/* Status Banner */}
        <div
          className={`h-1 w-full ${expired ? "bg-red-500" : "bg-green-500"}`}
        />

        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 pt-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-800 tracking-tight">
                {group.title}
              </CardTitle>
              <div className="flex gap-2 items-center flex-wrap">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full"
                >
                  {group.category}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant={isFull ? "destructive" : "default"}
                        className={`px-3 py-1 rounded-full ${
                          isFull
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Users className="mr-1 h-4 w-4" />
                        {group.memberCount}/{group.maxMembers}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isFull ? "Group is full" : "Available spots"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <p className="text-gray-600 leading-relaxed text-sm">
            {group.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 transition-all hover:bg-gray-100">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{group.location}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 transition-all hover:bg-gray-100">
              <div className="flex items-center text-gray-700">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Creator</p>
                  {creatorInfo ? (
                    <Link
                      href={`/profile/${group.creator}`}
                      className="font-medium hover:text-primary-600 hover:underline transition-colors"
                    >
                      {creatorInfo.name}
                    </Link>
                  ) : (
                    <p className="font-medium">{group.creatorName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 transition-all hover:bg-gray-100">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{group.expiryDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 transition-all hover:bg-gray-100">
              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-medium">{group.expiryTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members Section - Updated with profile links */}
          {group.joinedUserNames.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-3">Members</p>
              <div className="flex flex-wrap gap-2">
                {/* Use memberInfo if available, otherwise fall back to joinedUserNames */}
                {memberInfo.length > 0 ? (
                  memberInfo.map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                border-2 border-white flex items-center justify-center
                                shadow-sm"
                      >
                        <span className="text-xs font-medium text-white">
                          {member.name[0].toUpperCase()}
                        </span>
                      </div>
                      <span>{member.name}</span>
                    </Link>
                  ))
                ) : (
                  <div className="flex -space-x-2 mr-3">
                    {group.joinedUserNames.slice(0, 3).map((name, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                       border-2 border-white flex items-center justify-center
                                       shadow-sm hover:scale-105 transition-transform"
                            >
                              <span className="text-xs font-medium text-white">
                                {name[0].toUpperCase()}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {group.joinedUserNames.length > 3 && (
                      <div
                        className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white 
                                    flex items-center justify-center shadow-sm"
                      >
                        <span className="text-xs font-medium text-gray-600">
                          +{group.joinedUserNames.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-4 border-t bg-gray-50">
          <Button
            className={`w-full transition-all duration-300 ${
              group.joined
                ? "bg-red-500 hover:bg-red-600"
                : expired
                ? "bg-gray-300"
                : isFull
                ? "bg-gray-300"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={() => onJoinToggle(group.id)}
            disabled={(!group.joined && isFull) || expired}
          >
            {group.joined
              ? "Leave Group"
              : expired
              ? "Group Expired"
              : isFull
              ? "Group Full"
              : "Join Group"}
          </Button>

          {isCreator && (
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 
                   hover:border-red-300 transition-colors duration-300"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Group
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GroupCard;
