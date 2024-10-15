import { collection, getDocs } from "firebase/firestore";
import { db } from "@/backend/firebase";
import { TEventWithoutKey } from "@/context/eventsContext";

export default async function getAllEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    const res = querySnapshot.docs.map((doc) => {
      const data = doc.data() as TEventWithoutKey;
      return { key: doc.id, ...data };
    });
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
}
