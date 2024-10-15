import { collection, getDocs } from "firebase/firestore";
import { db } from "@/backend/firebase";
import { TCourseWithoutKey } from "@/context/courseContext";

export default async function getAllCourses(ref: string) {
  try {
    const querySnapshot = await getDocs(collection(db, ref));
    const res = querySnapshot.docs.map((doc) => {
      const data = doc.data() as TCourseWithoutKey;
      return { key: doc.id, ...data };
    });
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
}
