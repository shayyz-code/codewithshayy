import { addDoc, collection } from "firebase/firestore"
import { db } from "@/backend/firebase"
import { TSelectItem } from "@/ui/SelectInput"

type TAddEnrolled = {
  name: string
  email: string
  course: TSelectItem
}

export default async function addEnrolled(data: TAddEnrolled) {
  try {
    const resEnrolled = await addDoc(collection(db, "enrolled"), data)
    const docId = resEnrolled.id
    console.log(resEnrolled)
    return { docId: docId, status: "ok" }
  } catch (error) {
    console.log(error)
    return { docId: "", status: "fail" }
  }
}
