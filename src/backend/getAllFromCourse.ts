import { doc, getDoc } from "firebase/firestore";
import { db } from "@/backend/firebase";
import {
  TCourseDetail,
  TCourseDetailWithoutKey,
} from "@/context/courseContext";

export default async function getAllCourses(ref: string, subRef: string) {
  try {
    const q = doc(db, ref, subRef);
    const querySnapshot = await getDoc(q);

    if (querySnapshot.exists()) {
      const data = querySnapshot.data() as TCourseDetailWithoutKey;

      const res: TCourseDetail = { key: querySnapshot.id, ...data };
      return res;
    }
  } catch (error) {
    console.log(error);
  }
}
