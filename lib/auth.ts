import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
// Signup with Email
export const signUp = async (email: string, password: string) => {
  // 🔍 Check if the email is already registered
  const q = query(collection(db, "users"), where("email", "==", email));
  const existingUsers = await getDocs(q);

  if (!existingUsers.empty) {
    throw new Error("User already exists. Please login instead.");
  }

  // ✅ If not registered, proceed with signup
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // 📝 Store user data in Firestore
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    name,
    email,
    wallet: 0,
    rating: 0,
    createdAt: new Date(),
  });

  return user;
};

// Login with Email
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Google Sign-in
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// Logout
export const logout = async () => {
  return await signOut(auth);
};
