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

interface GroupCardProps {
  group: group;
  onJoinToggle: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  userId?: string;
}

const GroupCard = ({
  group,
  onJoinToggle,
  onDelete,
  userId,
}: GroupCardProps) => {
  const isCreator = userId === group.creator;
  const isFull = group.memberCount >= group.maxMembers;

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-amber-100 rounded-t-lg pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">
              {group.title}
            </CardTitle>
            <Badge variant="secondary" className="mt-2 px-2 bg-violet-200">
              {group.category}
            </Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant={isFull ? "destructive" : "default"}
                  className="ml-2"
                >
                  {group.memberCount}/{group.maxMembers}
                  <Users className="ml-1 h-4 w-4" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFull ? "Group is full" : "Available spots"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <p className="text-gray-600 leading-relaxed">{group.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {group.location}
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            Created by {group.creatorName}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {group.expiryDate}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {group.expiryTime}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {group.joinedUserNames.length > 0 && (
            <div className="flex -space-x-2">
              {group.joinedUserNames.slice(0, 3).map((name, i) => (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-white">{name[0]}</span>{" "}
                        {/* Show Initial */}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{name}</p> {/* Show full name on hover */}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {group.joinedUserNames.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    +{group.joinedUserNames.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        <Button
          className="w-full"
          variant={group.joined ? "destructive" : "default"}
          onClick={() => onJoinToggle(group.id)}
          disabled={!group.joined && isFull}
        >
          {group.joined ? "Leave Group" : isFull ? "Group Full" : "Join Group"}
        </Button>

        {isCreator && (
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(group.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Group
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
