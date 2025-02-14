import { collection, getDocs } from "firebase/firestore"
import { db } from "@/backend/firebase"
import { TProjectWithoutKey } from "@/context/projectsContext"

export default async function getAllProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"))
    const res = querySnapshot.docs.map((doc) => {
      const data = doc.data() as TProjectWithoutKey
      return { key: doc.id, ...data }
    })
    return res
  } catch (error) {
    console.log(error)
    return []
  }
}
