"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Users,
  Wrench,
  Wallet,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { getUserFromDB } from "@/lib/firebaseutils";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Task Marketplace", href: "/marketplace", icon: Briefcase },
  { name: "Group Activities", href: "/groups", icon: Users },
  { name: "Services", href: "/services", icon: Wrench },
];

const Navbar = () => {
  const { user, userData, signInWithGoogle, logout, loading } = useAuth();
  console.log(userData);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setWalletBalance] = useState<number | null>(null);
  const [balanceloading, setbalanceloading] = useState<boolean>(false);
  // console.log(user?.photoURL);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      setbalanceloading(true);
      if (userData?.wallet) {
        setbalanceloading(false);
        setWalletBalance(userData?.wallet);
      } else {
        setbalanceloading(false);
        setWalletBalance(0);
      }
    };
    fetchWalletBalance();
  }, [userData]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }
  const WalletButton = () => {
    const handleTopUp = (amount: number) => {
      // PhonePe details
      const phoneNumber = "8919579260"; // Your PhonePe number
      const upiId = "8919579260@ybl";
      const merchantName = encodeURIComponent("Chukka Abhishek Mahin Prabhas");

      // Check if user is on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Mobile behavior - Show options dialog
        toast.info(
          <div className="space-y-3">
            <p className="font-medium">Choose Payment Method:</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  window.location.href = `tel:${phoneNumber}`;
                }}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Pay via PhonePe Number
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(upiId);
                  toast.success("UPI ID copied!");
                }}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy UPI ID
              </button>
              <div className="text-sm text-gray-600 mt-2">
                <p>Amount to Pay: ₹{amount}</p>
                <p>UPI ID: {upiId}</p>
                <p>Phone: {phoneNumber}</p>
              </div>
            </div>
          </div>,
          {
            duration: 20000,
          }
        );
      } else {
        // Desktop behavior
        toast.info(
          <div className="space-y-2">
            <p className="font-medium">Desktop Payment Options:</p>
            <p>UPI ID: {upiId}</p>
            <p>Phone: {phoneNumber}</p>
            <p>Amount: ₹{amount}</p>
            <div className="space-y-2 mt-2">
              <button
                onClick={() => navigator.clipboard.writeText(upiId)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Copy UPI ID
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(phoneNumber)}
                className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 ml-2"
              >
                Copy Phone Number
              </button>
            </div>
          </div>,
          {
            duration: 20000,
          }
        );
      }
    };

    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>{balanceloading ? "loading.." : "₹" + balance}</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="space-y-4 mt-4">
            <h2 className="text-xl font-bold">Top Up Wallet</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleTopUp(1)}>₹1</Button>
              <Button onClick={() => handleTopUp(50)}>₹50</Button>
              <Button onClick={() => handleTopUp(100)}>₹100</Button>
              <Button onClick={() => handleTopUp(200)}>₹200</Button>
              <Button onClick={() => handleTopUp(500)}>₹500</Button>
              <Button onClick={() => handleTopUp(1000)}>₹1000</Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Payment Instructions:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Use PhonePe number or UPI ID to pay</li>
                <li>Add note: "Wallet TopUp"</li>
                <li>Balance will update after verification</li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  const NavItems = ({ mobile = false }) => (
    <ul
      className={`flex ${mobile ? "flex-col space-y-4" : "items-center gap-6"}`}
    >
      {navigationItems.map((item) => (
        <li key={item.name}>
          <Link href={item.href}>
            <span
              className={`flex items-center gap-3 block  hover:text-gray-900 hover:bg-yellow-400 hover:rounded-md  p-1  ${
                mobile ? "text-lg" : ""
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="container mx-auto px-4 py-5 shadow-2xss border-b">
      <div className="flex justify-between items-center">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <div className="mt-8 flex flex-col space-y-6">
                <div className="ml-1 font-bold text-2xl">Menu</div>
                <NavItems mobile />
                <WalletButton />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-2xl font-bold">Logo</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 w-fit bg-amber-100 py-1 px-4 rounded-2xl">
          <NavItems />
          <WalletButton />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!user ? (
            <Button variant="default" onClick={signInWithGoogle}>
              Login
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  toast("User logged out");
                }}
              >
                Logout
              </Button>
              <Avatar>
                <AvatarImage src={user.photoURL!} alt="User" />
                <AvatarFallback>
                  {user.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
