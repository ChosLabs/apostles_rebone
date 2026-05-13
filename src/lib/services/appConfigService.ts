import { db } from "../firebase/client";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const CONFIG_REF = () => doc(db, "appConfig", "settings");

export async function setGuestMode(enabled: boolean) {
  await setDoc(CONFIG_REF(), { guestModeEnabled: enabled }, { merge: true });
}

export function subscribeGuestMode(cb: (enabled: boolean, fromCache: boolean) => void) {
  return onSnapshot(CONFIG_REF(), { includeMetadataChanges: true }, (snap) => {
    cb(
      snap.exists() ? Boolean(snap.data()?.guestModeEnabled) : false,
      snap.metadata.fromCache,
    );
  });
}
