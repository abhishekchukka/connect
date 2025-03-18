"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserData {
  uid: string;
  name: string;
  email: string;
  image: string;
  wallet: number;
  rating: number;
  createdTasks: string[];
  joinedGroups: string[];
  offeredServices: string[];
  createdGroups: string[];
  joinedTasks: string[];
  completedTasks: string[];
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (data: Partial<UserData>, place?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  loading: true,
  updateUser: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if user exists in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        setUserData(userSnap.data() as UserData);

        if (!userSnap.exists()) {
          // Create new user in Firestore
          await setDoc(userRef, {
            uid: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            image: currentUser.photoURL,
            wallet: 10, // Default wallet balance
            rating: 0, // Default rating
            completedTasks: [],
            createdTasks: [],
            joinedGroups: [],
            joinedTasks: [],
            createdGroups: [],
            offeredServices: [],
            createdAt: new Date(),
          });
        }

        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUser = async (
    data: Partial<UserData>,
    place: string = "profile"
  ) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      const userRef = doc(db, "users", user.uid);

      // Remove any undefined or null values
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Update the document
      await updateDoc(userRef, cleanedData);

      // Fetch updated user data
      const updatedUserSnap = await getDoc(userRef);
      setUserData(updatedUserSnap.data() as UserData);
      switch (place) {
        case "profile":
          toast.success(`${place} updated successfully!`);
        // case "group":
        // toast.success(`${place} updated successfully!`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update profile");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error("Failed to sign in with Google");
    }
  };
  const refreshUser = async () => {
    try {
      if (!user) {
        console.warn("Cannot refresh user data: No user is logged in");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserData);
      } else {
        console.warn("User document not found in Firestore");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      toast.error("Failed to refresh user data");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        signInWithGoogle,
        logout,
        loading,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
