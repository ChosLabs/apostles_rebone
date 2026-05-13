import { db } from "../firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { Participant, User } from "@/types/database";

const SESSION_KEY = "rebone_session";

export const login = async (name: string, phoneLast4: string): Promise<User | null> => {
  // 1. Check for Admin
  if (name === "admin" && phoneLast4 === "2585") {
    const adminUser: User = {
      uid: "admin-id",
      email: "admin@apostles.com",
      name: "관리자",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    saveSession(adminUser);
    return adminUser;
  }

  // 2. Check for Participant
  const participantsRef = collection(db, "participants");
  const q = query(participantsRef, where("name", "==", name));
  const querySnapshot = await getDocs(q);

  let foundParticipant: Participant | null = null;
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Omit<Participant, "id"> & { pin?: string };
    const passwordMatch = data.pin
      ? data.pin === phoneLast4
      : data.phone.replace(/-/g, "").endsWith(phoneLast4);
    if (passwordMatch) {
      foundParticipant = { id: docSnap.id, ...data } as Participant;
    }
  });

  if (foundParticipant) {
    const p = foundParticipant as Participant;
    const user: User = {
      uid: p.id,
      email: "",
      name: p.name,
      role: "user",
      createdAt: p.createdAt,
      team: p.team,
      group: p.group,
      phone: p.phone,
      birthYear: p.birthYear,
      room: p.room,
      attendanceType: p.attendanceType
    };
    saveSession(user);
    return user;
  }

  return null;
};

export const verifyPassword = async (userId: string, phoneLast4: string): Promise<boolean> => {
  if (userId === "admin-id") return phoneLast4 === "2585";

  const snap = await getDoc(doc(db, "participants", userId));
  if (!snap.exists()) return false;

  const data = snap.data() as Omit<Participant, "id"> & { pin?: string };
  if (data.pin) return data.pin === phoneLast4;
  return data.phone.replace(/-/g, "").endsWith(phoneLast4);
};

export const changePassword = async (userId: string, newPin: string): Promise<void> => {
  await updateDoc(doc(db, "participants", userId), { pin: newPin });
};

export const resetPin = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, "participants", userId), { pin: deleteField() });
};

export const getParticipantPin = async (userId: string): Promise<string | null> => {
  const snap = await getDoc(doc(db, "participants", userId));
  if (!snap.exists()) return null;
  return (snap.data() as { pin?: string }).pin ?? null;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "/login";
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    try {
      return JSON.parse(session) as User;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const saveSession = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};
