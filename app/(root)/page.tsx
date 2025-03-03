"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// 📌 Dummy Data - Improved & More Realistic
const openGroups = [
  {
    id: 1,
    title: "React Developers",
    description:
      "Discuss best practices, performance, and state management in React.",
    members: 120,
  },
  {
    id: 2,
    title: "AI Enthusiasts",
    description:
      "Explore AI concepts, research papers, and hands-on ML projects.",
    members: 95,
  },
  {
    id: 3,
    title: "Freelancers Hub",
    description: "A place for freelancers to share tips and find gigs.",
    members: 85,
  },
  {
    id: 4,
    title: "React Developers",
    description:
      "Discuss best practices, performance, and state management in React.",
    members: 120,
  },
  {
    id: 5,
    title: "AI Enthusiasts",
    description:
      "Explore AI concepts, research papers, and hands-on ML projects.",
    members: 95,
  },
  {
    id: 6,
    title: "Freelancers Hub",
    description: "A place for freelancers to share tips and find gigs.",
    members: 85,
  },
];

const openTasks = [
  {
    id: 1,
    title: "Build a Landing Page",
    description: "Need a simple responsive landing page using Tailwind CSS.",
    reward: "$50",
  },
  {
    id: 2,
    title: "Fix a JavaScript Bug",
    description: "Resolve an issue in a Node.js application.",
    reward: "$30",
  },
  {
    id: 3,
    title: "Write a Blog Post",
    description: "Technical article on 'GraphQL vs REST' for a developer blog.",
    reward: "$40",
  },
];

const availableServices = [
  {
    id: 1,
    title: "Resume Review",
    description: "Get feedback on your resume from industry professionals.",
    price: "$10",
  },
  {
    id: 2,
    title: "1-on-1 Coding Session",
    description: "Live session to solve your coding doubts.",
    price: "$25",
  },
  {
    id: 3,
    title: "Portfolio Feedback",
    description: "Detailed review of your web developer portfolio.",
    price: "$15",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-[500px] text-black "
        style={{
          backgroundImage: "url('/20943526.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
            <span className="p-2">Learn.</span>{" "}
            <span className="p-2">Collaborate.</span>{" "}
            <span className="p-2">Grow.</span>
          </h1>
          <p className="text-lg md:text-3xl font-semibold text-center ">
            Connect with developers,{" "}
            <span className="p-2 bg-white rounded-r-xl rounded-l-3xl">
              join hands-on projects, and improve your skills with the
              community.
            </span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-20 space-y-12">
        {/* Open Groups */}
        <Section
          title="Open Groups"
          items={openGroups}
          buttonText="Join Now"
          buttonHandler={(group) => alert(`Joined group: ${group.title}`)}
          renderInfo={(group) => (
            <p className="text-sm text-gray-500">{group.members} members</p>
          )}
          showMoreHref="/groups"
        />

        {/* Open Tasks */}
        <Section
          title="Open Tasks"
          items={openTasks}
          buttonText="Take Task"
          buttonHandler={(task) => alert(`Task taken: ${task.title}`)}
          renderInfo={(task) => (
            <p className="text-sm font-semibold text-green-600">
              {task.reward}
            </p>
          )}
          showMoreHref="/tasks"
        />

        {/* Available Services */}
        <Section
          title="Available Services"
          items={availableServices}
          buttonText="Request"
          buttonHandler={(service) =>
            alert(`Service requested: ${service.title}`)
          }
          renderInfo={(service) => (
            <p className="text-sm font-semibold text-blue-600">
              {service.price}
            </p>
          )}
          showMoreHref="/services"
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

// 📌 Reusable Section Component
function Section({
  title,
  items,
  buttonText,
  buttonHandler,
  renderInfo,
  showMoreHref,
}: {
  title: string;
  items: Array<{ id: number; title: string; description: string }>;
  buttonText: string;
  buttonHandler: (item: any) => void;
  renderInfo: (item: any) => JSX.Element;
  showMoreHref: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href={showMoreHref}>
          <Button variant="ghost" className="flex items-center gap-2">
            Show More <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Cards */}
      <div className="flex gap-6   overflow-x-scroll no-scrollbar ">
        {items.map((item) => (
          <Card
            key={item.id}
            className="p-4 min-w-[420px] border hover:shadow-lg transition-all"
          >
            <CardHeader>
              <CardTitle className="bg-amber-300 w-fit rounded-md shadow-md px-1 py-2">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{item.description}</p>
              {renderInfo(item)}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => buttonHandler(item)}>
                {buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
