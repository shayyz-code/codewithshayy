import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/backend/firebase";
import { TEventWithoutKey } from "@/context/eventsContext";

export default async function getUpcomingEvent() {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("role", "==", "upcoming"));
    const querySnapshots = await getDocs(q);

    const res = querySnapshots.docs.map((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TEventWithoutKey;
        return { key: snapshot.id, ...data };
      }
    });
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
