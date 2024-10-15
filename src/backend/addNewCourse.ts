import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/backend/firebase";
import { TAddCourseWithoutKey } from "@/context/addCourseContext";

export default async function addNewCourse(data: TAddCourseWithoutKey) {
  try {
    const resDetails = await addDoc(collection(db, "courses"), data);
    const docId = resDetails.id;
    const resBrief = await setDoc(doc(db, "courses_brief", docId), {
      title: data.title,
      description: data.description,
      slug: data.slug,
      tags: data.tags,
      photo_url: data.photo_url,
    });
    console.log(resDetails);
    console.log(resBrief);
    return { docId: docId, status: "ok" };
  } catch (error) {
    console.log(error);
    return { docId: "", status: "fail" };
  }
}
