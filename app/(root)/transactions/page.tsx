"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthProvider";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import LoginPrompt from "@/components/ui/loginBanner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWallet } from "@/lib/context/WalletProvider";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  utrNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  adminComment: string | null;
}

export default function TransactionsPage() {
  const { user, userData } = useAuth();
  const { openWallet } = useWallet();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch user transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        // Simple query without orderBy to avoid index issues
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const transactionsData: Transaction[] = [];

        querySnapshot.forEach((doc) => {
          transactionsData.push({
            id: doc.id,
            ...doc.data(),
          } as Transaction);
        });

        // Sort manually in JavaScript
        transactionsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        // Filter by status if needed
        const filteredData =
          filter === "all"
            ? transactionsData
            : transactionsData.filter((t) => t.status === filter);

        setTransactions(filteredData);
        setError(null);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, filter]);

  const handleTopUpClick = () => {
    // Open wallet sheet and navigate to home
    openWallet();
    // router.push("/");
  };

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Your Transactions</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">Wallet Balance</h2>
            <p className="text-3xl font-bold">₹{userData?.wallet || 0}</p>
          </div>
          <Button onClick={handleTopUpClick}>Top Up Wallet</Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          className={`px-4 py-2 rounded-md ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setFilter("all")}
        >
          All Transactions
        </button>
        <button
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setFilter("pending")}
        >
          <Clock className="h-4 w-4" />
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            filter === "approved" ? "bg-green-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setFilter("approved")}
        >
          <CheckCircle className="h-4 w-4" />
          Approved
        </button>
        <button
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            filter === "rejected" ? "bg-red-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setFilter("rejected")}
        >
          <XCircle className="h-4 w-4" />
          Rejected
        </button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm border">
          <p className="text-gray-500 mb-4">No transactions found</p>
          <p className="text-sm text-gray-400 mb-6">
            {filter !== "all"
              ? `You don't have any ${filter} transactions.`
              : "Start by adding money to your wallet."}
          </p>
          <Button onClick={handleTopUpClick}>Top Up Wallet</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white p-5 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-medium">
                      ₹{transaction.amount}
                    </span>
                    {transaction.status === "pending" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {transaction.status === "approved" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                      </span>
                    )}
                    {transaction.status === "rejected" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="mr-1 h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Transaction ID:{" "}
                    <span className="font-mono">{transaction.utrNumber}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {transaction.createdAt?.toDate().toLocaleString()}
                  </p>
                  {transaction.adminComment && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-100">
                      <p className="text-sm">
                        <span className="font-medium">Admin comment:</span>{" "}
                        {transaction.adminComment}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {transaction.status === "pending" ? (
                    <p className="text-sm text-yellow-600">
                      Awaiting verification
                    </p>
                  ) : transaction.status === "approved" ? (
                    <p className="text-sm text-green-600">Added to wallet</p>
                  ) : (
                    <p className="text-sm text-red-600">Not processed</p>
                  )}
                  {transaction.updatedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {transaction.updatedAt.toDate().toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
