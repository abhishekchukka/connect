import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load components that aren't immediately visible
export const RunningTasksSection = dynamic(
  () => import("./RunningTasksSection"),
  {
    loading: () => <LoadingCard />,
  }
);

export const AssignedTasksSection = dynamic(() => import("./AssignedTasks"), {
  loading: () => <LoadingCard />,
});

// Loading component
const LoadingCard = () => (
  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);
export default LoadingCard;
