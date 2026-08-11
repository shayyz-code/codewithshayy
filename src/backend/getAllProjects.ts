import { collection, getDocs } from "firebase/firestore"
import { getDb } from "@/backend/firebase"
import { TProjectWithoutKey } from "@/context/projectsContext"

export default async function getAllProjects() {
  try {
    const querySnapshot = await getDocs(collection(getDb(), "projects"))
    const res = querySnapshot.docs.map((doc) => {
      const data = doc.data() as TProjectWithoutKey
      return { key: doc.id, ...data }
    })
    return res
  } catch (error) {
    console.error("getAllProjects failed", error)
    return []
  }
}
