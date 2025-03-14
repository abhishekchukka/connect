import { FC } from "react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/context/TaskContext";
import { Calendar, Gift, Trash, Clock, User, Users } from "lucide-react";
import { useAuth } from "@/lib/context/AuthProvider";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    reward: string;
    deadline: string;
    status: string;
    creator: string;
    appliedPeople: string[];
    createdAt: string;
  };
}

const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const { acceptTask, deleteTask, joinTask, refreshTasks } = useTasks();
  const { user } = useAuth();

  const isCreator = user?.uid === task.creator;
  const hasApplied = task.appliedPeople?.includes(user?.uid);
  const applicantsCount = task.appliedPeople?.length || 0;

  return (
    <div className="bg-white  rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Status Banner */}
      <div
        className={`px-4 py-1 text-white text-xs font-medium
          ${task.status === "expired" ? "bg-red-500" : "bg-blue-500"}
        `}
      >
        {task.status}
      </div>

      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between relative items-start mb-4">
          <h3 className="text-xl font-bold  text-gray-800 hover:text-blue-600 transition-colors">
            {task.title}
          </h3>
          {isCreator && (
            <Button
              onClick={() => deleteTask(task.id, task.reward)}
              variant="ghost"
              size="icon"
              className="text-gray-400 absolute hover:text-red-500 transition-colors top-2 right-2"
            >
              <Trash size={18} />
            </Button>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6 line-clamp-2">{task.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3">
            <Gift size={18} className="text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Reward</p>
              <p className="font-semibold text-gray-700">{task.reward}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-3">
            <Calendar size={18} className="text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="font-semibold text-gray-700">
                {new Date(task.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>{applicantsCount} applicants</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>
                Posted {formatDistanceToNow(new Date(task.createdAt))} ago
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isCreator && !hasApplied && (
              <Button
                onClick={() => {
                  joinTask(task.id, user.uid);
                  refreshTasks();
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Accept Task
              </Button>
            )}
            {hasApplied && (
              <Button
                variant="secondary"
                disabled
                className="w-full bg-gray-100 text-gray-500"
              >
                Already Applied
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
