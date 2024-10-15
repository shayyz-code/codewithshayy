import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/backend/firebase";
import { TAddCourse } from "@/context/addCourseContext";

export default async function editCourse(data: TAddCourse) {
  try {
    const resDetails = await updateDoc(doc(db, "courses", data.key), data);
    const resBrief = await updateDoc(doc(db, "courses_brief", data.key), {
      title: data.title,
      description: data.description,
      slug: data.slug,
      tags: data.tags,
      photo_url: data.photo_url,
    });
    console.log(resDetails);
    console.log(resBrief);
    return { docId: data.key, status: "ok" };
  } catch (error) {
    console.log(error);
    return { docId: "", status: "fail" };
  }
}
