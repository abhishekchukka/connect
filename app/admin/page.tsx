"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthProvider";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock } from "lucide-react";

// Admin user ID - replace with your admin user ID
const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

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

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  // Check if user is admin
  useEffect(() => {
    if (user && user.uid !== ADMIN_USER_ID) {
      toast.error("You don't have permission to access this page");
      router.push("/");
    }
  }, [user, router]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        let q;
        if (filter === "all") {
          q = query(collection(db, "transactions"));
        } else {
          q = query(
            collection(db, "transactions"),
            where("status", "==", filter)
          );
        }

        const querySnapshot = await getDocs(q);
        const transactionsData: Transaction[] = [];

        querySnapshot.forEach((doc) => {
          transactionsData.push({
            id: doc.id,
            ...doc.data(),
          } as Transaction);
        });

        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, filter]);

  const handleApprove = async (transaction: Transaction) => {
    if (!user) return;

    try {
      // Update transaction status
      const transactionRef = doc(db, "transactions", transaction.id);
      await updateDoc(transactionRef, {
        status: "approved",
        updatedAt: new Date(),
        adminComment: "Payment verified and approved",
      });

      // Update user's wallet balance
      const userRef = doc(db, "users", transaction.userId);
      await updateDoc(userRef, {
        wallet: increment(transaction.amount),
      });

      toast.success(
        `Approved ₹${transaction.amount} top-up for ${transaction.userName}`
      );

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? {
                ...t,
                status: "approved",
                updatedAt: Timestamp.now(),
                adminComment: "Payment verified and approved",
              }
            : t
        )
      );
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error("Failed to approve transaction");
    }
  };

  const handleReject = async (transaction: Transaction, reason: string) => {
    if (!user) return;

    try {
      // Update transaction status
      const transactionRef = doc(db, "transactions", transaction.id);
      await updateDoc(transactionRef, {
        status: "rejected",
        updatedAt: new Date(),
        adminComment: reason || "Payment verification failed",
      });

      toast.success(`Rejected top-up request from ${transaction.userName}`);

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? {
                ...t,
                status: "rejected",
                updatedAt: Timestamp.now(),
                adminComment: reason || "Payment verification failed",
              }
            : t
        )
      );
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast.error("Failed to reject transaction");
    }
  };

  if (!user || user.uid !== ADMIN_USER_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Admin Panel - Wallet Transactions
      </h1>

      {/* Filter Controls */}
      <div className="mb-6 flex gap-4">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          <Clock className="mr-2 h-4 w-4" />
          Pending
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approved
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          onClick={() => setFilter("rejected")}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Rejected
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No {filter !== "all" ? filter : ""} transactions found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">User</th>
                <th className="border p-3 text-left">Amount</th>
                <th className="border p-3 text-left">UTR Number</th>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3">
                    <div className="font-medium">{transaction.userName}</div>
                    <div className="text-sm text-gray-500">
                      {transaction.userEmail}
                    </div>
                  </td>
                  <td className="border p-3 font-medium">
                    ₹{transaction.amount}
                  </td>
                  <td className="border p-3 font-mono">
                    {transaction.utrNumber}
                  </td>
                  <td className="border p-3">
                    {transaction.createdAt?.toDate().toLocaleString()}
                  </td>
                  <td className="border p-3">
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
                  </td>
                  <td className="border p-3">
                    {transaction.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(transaction)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt(
                              "Enter reason for rejection:"
                            );
                            if (reason !== null) {
                              handleReject(transaction, reason);
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {transaction.status !== "pending" && (
                      <div className="text-sm text-gray-500">
                        {transaction.adminComment || "No comment"}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
