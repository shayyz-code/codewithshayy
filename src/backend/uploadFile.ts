import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { storage } from "./firebase";

// const convertToBlob = (file: File): Promise<Blob> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const blob = new Blob([reader.result as ArrayBuffer], {
//         type: file.type,
//       });
//       resolve(blob);
//     };
//     reader.onerror = reject;
//     reader.readAsArrayBuffer(file);
//   });
// };

export default async function uploadFile(
  folderName: string,
  fileName: string,
  file: any
) {
  try {
    const fileRef = ref(storage, folderName + "/" + fileName);
    const res = await uploadString(fileRef, file, "data_url");
    const url = await getDownloadURL(res.ref);
    return { url: url, status: "ok" };
  } catch (error) {
    console.log(error);
    return { url: "", status: "fail" };
  }
}
