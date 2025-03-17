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
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { WalletButton } from "./WalletButton";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Task Marketplace", href: "/marketplace", icon: Briefcase },
  { name: "Group Activities", href: "/groups", icon: Users },
  { name: "Services", href: "/services", icon: Wrench },
];

// Add admin link for admin user
const ADMIN_USER_ID = "rOloBGAk5UY7r8vLsgBIlrJMjcE3";

const Navbar = () => {
  const { user, userData, signInWithGoogle, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setWalletBalance] = useState<number | null>(null);
  const [balanceloading, setbalanceloading] = useState<boolean>(false);

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

  const NavItems = ({ mobile = false }) => {
    const navItems = [...navigationItems];

    // Add admin link for admin user
    if (user && user.uid === ADMIN_USER_ID) {
      navItems.push({
        name: "Admin Panel",
        href: "/admin",
        icon: () => <span className="h-4 w-4 flex items-center">👑</span>,
      });
    }

    return (
      <ul
        className={`flex ${
          mobile ? "flex-col space-y-4" : "items-center gap-6"
        }`}
      >
        {navItems.map((item) => (
          <li key={item.name}>
            <Link href={item.href}>
              <span
                className={`flex items-center gap-3 block hover:text-gray-900 hover:bg-yellow-400 hover:rounded-md p-1 ${
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
  };

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
                <WalletButton
                  balance={balance}
                  balanceloading={balanceloading}
                />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-2xl font-bold">Logo</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 w-fit bg-amber-100 py-1 px-4 rounded-2xl">
          <NavItems />
          <WalletButton balance={balance} balanceloading={balanceloading} />
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
