import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const getUserFromDB = async (uid: string) => {
  try {
    if (!uid) throw new Error("User ID is required");

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }; // Return user data
    } else {
      console.log("No user found in database");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
