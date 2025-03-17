"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Wallet, Copy, Check, QrCode, History } from "lucide-react";
import { useAuth } from "@/lib/context/AuthProvider";

import { toast } from "sonner";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import QRCode from "react-qr-code";
import Link from "next/link";
import { useWallet } from "@/lib/context/WalletProvider";

export const WalletButton = ({
  balance,
  balanceloading,
}: {
  balance: number | null;
  balanceloading: boolean;
}) => {
  const { user } = useAuth();
  const { isWalletOpen, closeWallet } = useWallet();
  const [amount, setAmount] = useState<number>(100);
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [confirmUtrNumber, setConfirmUtrNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<"select" | "payment" | "verify">("select");
  const [copied, setCopied] = useState<"upi" | "phone" | null>(null);
  const [open, setOpen] = useState(false);

  // Sync with context
  useEffect(() => {
    setOpen(isWalletOpen);
  }, [isWalletOpen]);

  // Update context when sheet closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      closeWallet();
    }
  };

  // Payment details
  const upiId = "8919579260@ybl";
  const phoneNumber = "8919579260";
  const merchantName = "Chukka Abhishek Mahin Prabhas";

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setStep("payment");
  };

  const handleCopy = (text: string, type: "upi" | "phone") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVerifyStep = () => {
    // Reset UTR fields when moving to verify step
    setUtrNumber("");
    setConfirmUtrNumber("");
    setStep("verify");
  };

  const handleSubmitUTR = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    if (!utrNumber.trim()) {
      toast.error("Please enter UTR number");
      return;
    }

    // Check if UTR numbers match
    if (utrNumber !== confirmUtrNumber) {
      toast.error("UTR numbers don't match. Please check and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add transaction to Firestore
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        amount: amount,
        utrNumber: utrNumber,
        status: "pending", // pending, approved, rejected
        createdAt: serverTimestamp(),
        updatedAt: null,
        adminComment: null,
      });

      toast.success("Top-up request submitted successfully!");
      setStep("select");
      setUtrNumber("");
      setConfirmUtrNumber("");
    } catch (error) {
      console.error("Error submitting top-up request:", error);
      toast.error("Failed to submit top-up request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "select":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Top Up Wallet</h2>
              <Link href="/transactions">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 50, 100, 200, 500, 1000].map((amt) => (
                <Button
                  key={amt}
                  onClick={() => handleAmountSelect(amt)}
                  variant={amount === amt ? "default" : "outline"}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Make Payment</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("select")}
              >
                Back
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                <div className="font-medium">Amount to Pay</div>
                <div className="text-2xl font-bold">₹{amount}</div>
              </div>

              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white rounded-lg">
                  <QRCode
                    value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(
                      merchantName
                    )}&am=${amount}&cu=INR`}
                    size={150}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <div>
                    <div className="text-xs text-gray-500">UPI ID</div>
                    <div className="font-medium">{upiId}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(upiId, "upi")}
                  >
                    {copied === "upi" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <div>
                    <div className="text-xs text-gray-500">Phone Number</div>
                    <div className="font-medium">{phoneNumber}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(phoneNumber, "phone")}
                  >
                    {copied === "phone" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={handleVerifyStep}>
              I've Made the Payment
            </Button>
          </div>
        );

      case "verify":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Verify Payment</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("payment")}
              >
                Back
              </Button>
            </div>

            <form onSubmit={handleSubmitUTR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  UTR Number / Transaction ID
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter UTR number"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can find this in your UPI app payment history
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm UTR Number
                </label>
                <input
                  type="text"
                  value={confirmUtrNumber}
                  onChange={(e) => setConfirmUtrNumber(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    confirmUtrNumber && utrNumber !== confirmUtrNumber
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="Re-enter UTR number"
                  required
                />
                {confirmUtrNumber && utrNumber !== confirmUtrNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    UTR numbers don't match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  !utrNumber ||
                  !confirmUtrNumber ||
                  utrNumber !== confirmUtrNumber
                }
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </form>
          </div>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>{balanceloading ? "loading.." : "₹" + balance}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mt-6">
          {renderContent()}

          <div className="mt-8 text-sm text-gray-500">
            <p className="font-medium mb-2">Important Notes:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Make payment using any UPI app</li>
              <li>Enter the UTR number after payment</li>
              <li>Your wallet will be updated after admin verification</li>
              <li>This usually takes less than 24 hours</li>
              <li>
                <Link
                  href="/transactions"
                  className="text-blue-500 hover:underline"
                >
                  View your transaction history
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
