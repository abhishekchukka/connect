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
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from "lucide-react";

// Admin user ID - replace with your admin user ID
const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

interface BaseTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  adminComment: string | null;
}

interface DepositTransaction extends BaseTransaction {
  type: "deposit";
  utrNumber: string;
}

interface WithdrawalTransaction extends BaseTransaction {
  type: "withdrawal";
  requestedAmount: number;
  platformFee: number;
  finalAmount: number;
  upiId: string;
}

type Transaction = DepositTransaction | WithdrawalTransaction;

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTransactions, setProcessingTransactions] = useState<
    Set<string>
  >(new Set());
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "completed"
  >("pending");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "deposit" | "withdrawal"
  >("all");

  // Check if user is admin
  useEffect(() => {
    if (user && user.uid !== ADMIN_USER_ID) {
      toast.error("You don't have permission to access this page");
      router.push("/");
    }
  }, [user, router]);

  // Fetch transactions and withdrawals
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const allData: Transaction[] = [];

        // Fetch deposits from transactions collection
        let transactionsQuery = collection(db, "transactions");
        if (statusFilter !== "all") {
          transactionsQuery = query(
            transactionsQuery,
            where("status", "==", statusFilter)
          );
        }

        const transactionsSnapshot = await getDocs(transactionsQuery);
        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (typeFilter === "all" || typeFilter === "deposit") {
            allData.push({
              id: doc.id,
              ...data,
              type: "deposit",
            } as DepositTransaction);
          }
        });

        // Fetch withdrawals from withdrawals collection
        let withdrawalsQuery = collection(db, "withdrawals");
        if (statusFilter !== "all") {
          // Map "approved" to "completed" for withdrawals if needed
          const withdrawalStatus =
            statusFilter === "approved" ? "completed" : statusFilter;
          withdrawalsQuery = query(
            withdrawalsQuery,
            where("status", "==", withdrawalStatus)
          );
        }

        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        withdrawalsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (typeFilter === "all" || typeFilter === "withdrawal") {
            allData.push({
              id: doc.id,
              ...data,
              amount: data.finalAmount, // Use finalAmount as the display amount
              type: "withdrawal",
            } as WithdrawalTransaction);
          }
        });

        // Sort by createdAt (newest first)
        allData.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setTransactions(allData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, statusFilter, typeFilter]);

  const handleApproveDeposit = async (transaction: DepositTransaction) => {
    if (!user) return;

    // Prevent double processing
    if (processingTransactions.has(transaction.id)) {
      return;
    }

    try {
      // Mark this transaction as being processed
      setProcessingTransactions((prev) => new Set(prev).add(transaction.id));

      // Double-check current status to prevent double processing
      const transactionRef = doc(db, "transactions", transaction.id);
      const currentDoc = await getDoc(transactionRef);
      const currentData = currentDoc.data();

      if (!currentDoc.exists() || currentData?.status !== "pending") {
        toast.error("This transaction has already been processed");
        return;
      }

      // Update transaction status
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
      console.error("Error approving deposit:", error);
      toast.error("Failed to approve deposit");
    } finally {
      // Remove from processing set
      setProcessingTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
    }
  };

  const handleApproveWithdrawal = async (
    transaction: WithdrawalTransaction
  ) => {
    if (!user) return;

    // Prevent double processing
    if (processingTransactions.has(transaction.id)) {
      return;
    }

    try {
      // Mark this transaction as being processed
      setProcessingTransactions((prev) => new Set(prev).add(transaction.id));

      // Double-check current status to prevent double processing
      const withdrawalRef = doc(db, "withdrawals", transaction.id);
      const currentDoc = await getDoc(withdrawalRef);
      const currentData = currentDoc.data();

      if (!currentDoc.exists() || currentData?.status !== "pending") {
        toast.error("This withdrawal has already been processed");
        return;
      }

      // Update withdrawal status
      await updateDoc(withdrawalRef, {
        status: "completed",
        updatedAt: new Date(),
        adminComment: "Withdrawal processed successfully",
      });

      // Decrement the requested amount from user's wallet
      const userRef = doc(db, "users", transaction.userId);
      await updateDoc(userRef, {
        wallet: increment(-transaction.requestedAmount),
      });

      toast.success(
        `Approved ₹${transaction.finalAmount} withdrawal for ${transaction.userName}`
      );

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? {
                ...t,
                status: "completed",
                updatedAt: Timestamp.now(),
                adminComment: "Withdrawal processed successfully",
              }
            : t
        )
      );
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast.error("Failed to approve withdrawal");
    } finally {
      // Remove from processing set
      setProcessingTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
    }
  };

  const handleRejectDeposit = async (
    transaction: DepositTransaction,
    reason: string
  ) => {
    if (!user) return;

    // Prevent double processing
    if (processingTransactions.has(transaction.id)) {
      return;
    }

    try {
      // Mark this transaction as being processed
      setProcessingTransactions((prev) => new Set(prev).add(transaction.id));

      // Double-check current status to prevent double processing
      const transactionRef = doc(db, "transactions", transaction.id);
      const currentDoc = await getDoc(transactionRef);
      const currentData = currentDoc.data();

      if (!currentDoc.exists() || currentData?.status !== "pending") {
        toast.error("This transaction has already been processed");
        return;
      }

      // Update transaction status
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
      console.error("Error rejecting deposit:", error);
      toast.error("Failed to reject deposit");
    } finally {
      // Remove from processing set
      setProcessingTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
    }
  };

  const handleRejectWithdrawal = async (
    transaction: WithdrawalTransaction,
    reason: string
  ) => {
    if (!user) return;

    // Prevent double processing
    if (processingTransactions.has(transaction.id)) {
      return;
    }

    try {
      // Mark this transaction as being processed
      setProcessingTransactions((prev) => new Set(prev).add(transaction.id));

      // Double-check current status to prevent double processing
      const withdrawalRef = doc(db, "withdrawals", transaction.id);
      const currentDoc = await getDoc(withdrawalRef);
      const currentData = currentDoc.data();

      if (!currentDoc.exists() || currentData?.status !== "pending") {
        toast.error("This withdrawal has already been processed");
        return;
      }

      // Update withdrawal status
      await updateDoc(withdrawalRef, {
        status: "rejected",
        updatedAt: new Date(),
        adminComment: reason || "Withdrawal request rejected",
      });

      // Refund the amount to user's wallet
      const userRef = doc(db, "users", transaction.userId);
      await updateDoc(userRef, {
        wallet: increment(transaction.requestedAmount),
      });

      toast.success(
        `Rejected withdrawal and refunded ₹${transaction.requestedAmount} to ${transaction.userName}`
      );

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? {
                ...t,
                status: "rejected",
                updatedAt: Timestamp.now(),
                adminComment: reason || "Withdrawal request rejected",
              }
            : t
        )
      );
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast.error("Failed to reject withdrawal");
    } finally {
      // Remove from processing set
      setProcessingTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
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
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <h2 className="text-lg font-semibold">Transaction Type:</h2>
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => setTypeFilter("all")}
          >
            All Types
          </Button>
          <Button
            variant={typeFilter === "deposit" ? "default" : "outline"}
            onClick={() => setTypeFilter("deposit")}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Deposits
          </Button>
          <Button
            variant={typeFilter === "withdrawal" ? "default" : "outline"}
            onClick={() => setTypeFilter("withdrawal")}
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Withdrawals
          </Button>
        </div>

        <div className="flex gap-4">
          <h2 className="text-lg font-semibold">Status:</h2>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => setStatusFilter("approved")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            onClick={() => setStatusFilter("rejected")}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejected
          </Button>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All Statuses
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No {statusFilter !== "all" ? statusFilter : ""}
            {typeFilter !== "all" ? " " + typeFilter : ""} transactions found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">User</th>
                <th className="border p-3 text-left">Type</th>
                <th className="border p-3 text-left">Amount</th>
                <th className="border p-3 text-left">Details</th>
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
                  <td className="border p-3">
                    {transaction.type === "deposit" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <ArrowUpCircle className="mr-1 h-3 w-3" />
                        Deposit
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ArrowDownCircle className="mr-1 h-3 w-3" />
                        Withdrawal
                      </span>
                    )}
                  </td>
                  <td className="border p-3 font-medium">
                    ₹{transaction.amount}
                    {transaction.type === "withdrawal" && (
                      <div className="text-xs text-gray-500">
                        (Requested: ₹
                        {(transaction as WithdrawalTransaction).requestedAmount}
                        )
                      </div>
                    )}
                  </td>
                  <td className="border p-3 font-mono">
                    {transaction.type === "deposit" ? (
                      (transaction as DepositTransaction).utrNumber || "N/A"
                    ) : (
                      <div className="text-xs">
                        <div>
                          UPI: {(transaction as WithdrawalTransaction).upiId}
                        </div>
                        <div>
                          Fee: ₹
                          {(transaction as WithdrawalTransaction).platformFee}
                        </div>
                      </div>
                    )}
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
                    {(transaction.status === "approved" ||
                      transaction.status === "completed") && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {transaction.status === "approved"
                          ? "Approved"
                          : "Completed"}
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
                          disabled={processingTransactions.has(transaction.id)}
                          onClick={() =>
                            transaction.type === "deposit"
                              ? handleApproveDeposit(
                                  transaction as DepositTransaction
                                )
                              : handleApproveWithdrawal(
                                  transaction as WithdrawalTransaction
                                )
                          }
                        >
                          {processingTransactions.has(transaction.id) ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processingTransactions.has(transaction.id)}
                          onClick={() => {
                            const reason = prompt(
                              `Enter reason for rejecting this ${transaction.type}:`
                            );
                            if (reason !== null) {
                              transaction.type === "deposit"
                                ? handleRejectDeposit(
                                    transaction as DepositTransaction,
                                    reason
                                  )
                                : handleRejectWithdrawal(
                                    transaction as WithdrawalTransaction,
                                    reason
                                  );
                            }
                          }}
                        >
                          {processingTransactions.has(transaction.id) ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Reject"
                          )}
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
