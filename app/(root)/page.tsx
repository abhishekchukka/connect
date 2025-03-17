"use client";

import HeroSection from "@/components/HeroSection";
import Section from "@/components/home/Section";
import { useGroups } from "@/lib/context/GroupContext";
import { useTasks } from "@/lib/context/TaskContext";
import { useAuth } from "@/lib/context/AuthProvider";
import { PlusCircle, Users, Briefcase, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Testimonial component
const Testimonial = ({
  name,
  role,
  quote,
  rating,
}: {
  name: string;
  role: string;
  quote: string;
  rating: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white p-6 rounded-lg shadow-md"
  >
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
    <p className="text-gray-600 italic mb-4">"{quote}"</p>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
        {name.charAt(0)}
      </div>
      <div className="ml-3">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

// Feature card component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
  >
    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

export default function Home() {
  const { groups, toggleJoinGroup } = useGroups();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const router = useRouter();
  const [featuredGroups, setFeaturedGroups] = useState<any[]>([]);
  const [featuredTasks, setFeaturedTasks] = useState<any[]>([]);

  useEffect(() => {
    // Get featured groups (active groups with most members)
    if (groups && groups.length > 0) {
      const activeGroups = groups.filter((group) => group.status === "active");
      const sorted = [...activeGroups].sort(
        (a, b) => b.memberCount - a.memberCount
      );
      setFeaturedGroups(sorted.slice(0, 3));
    }

    // Get featured tasks (active tasks with highest rewards)
    if (tasks && tasks.length > 0) {
      const activeTasks = tasks.filter((task) => task.status === "pending");
      const sorted = [...activeTasks].sort(
        (a, b) => parseInt(b.reward) - parseInt(a.reward)
      );
      setFeaturedTasks(sorted.slice(0, 3));
    }
  }, [groups, tasks]);

  const handleCreateClick = () => {
    if (!user) {
      router.push("/login");
    } else {
      // Open a modal or navigate to create page
      router.push("/groups/create");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Features Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Why Join Our Community?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with like-minded individuals, collaborate on projects, and
              grow your skills in a supportive environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users size={24} />}
              title="Join Active Groups"
              description="Find and join groups based on your interests, from coding to study sessions and more."
            />
            <FeatureCard
              icon={<Briefcase size={24} />}
              title="Complete Tasks"
              description="Take on tasks, showcase your skills, and earn money for your contributions."
            />
            <FeatureCard
              icon={<Star size={24} />}
              title="Build Your Reputation"
              description="Earn ratings and reviews as you collaborate, establishing your credibility in the community."
            />
          </div>
        </section>

        {/* Featured Groups Section */}
        {featuredGroups.length > 0 && (
          <Section
            title="Featured Groups"
            items={featuredGroups}
            buttonText="Join Now"
            buttonHandler={toggleJoinGroup}
            renderInfo={(group) => (
              <div className="mt-2">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Users size={16} className="mr-1" />
                  <span>{group.memberCount} members</span>
                </div>
                {group.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {group.category}
                  </span>
                )}
              </div>
            )}
            showMoreHref="/groups"
          />
        )}

        {/* Featured Tasks Section */}
        {featuredTasks.length > 0 && (
          <Section
            title="Featured Tasks"
            items={featuredTasks}
            buttonText="Apply Now"
            buttonHandler={(taskId) => router.push(`/tasks/${taskId}`)}
            renderInfo={(task) => (
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Reward: ₹{task.reward}
                </span>
              </div>
            )}
            showMoreHref="/tasks"
          />
        )}

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
              <p className="text-primary-100">
                Join our community today and start collaborating!
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
      </div>
    </div>
  );
}
