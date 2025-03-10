"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Section({
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
  // Use an object to track the join state for each item by its ID
  // const [joinStates, setJoinStates] = useState<Record<number, boolean>>({});

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
      <div className="flex gap-6 overflow-x-scroll no-scrollbar">
        {items.map((item) => {
          // Get the current join state for this specific item
          // const isJoined = joinStates[item.id] || false;

          return (
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
                <Button
                  className="w-full"
                  onClick={async () => {
                    await buttonHandler(item.id);
                    // Toggle the join state for this specific item
                  }}
                >
                  {item.joined ? "Exit" : buttonText}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
