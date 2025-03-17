"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, Construction, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ServicesPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6 sm:p-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Construction className="h-8 w-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Services Coming Soon
            </h1>
          </div>
          <p className="text-primary-100 text-sm sm:text-base">
            We're working hard to bring you a marketplace of services. Stay
            tuned for exciting updates!
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Rocket className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">What to Expect</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Offer your skills as services</li>
                <li>• Browse services offered by others</li>
                <li>• Secure payment system</li>
                <li>• Rating and review system</li>
                <li>• Service categories and search</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold">Launch Timeline</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p>Planning Phase: Completed</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p>Design Phase: Completed</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                  <p>Development: In Progress</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <p>Testing: Coming Soon</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <p>Launch: Coming Soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">
              In the meantime, check out our other features or return to the
              dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/groups">Explore Groups</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ServicesPage;
