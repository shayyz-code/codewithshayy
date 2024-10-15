import uploadFile from "@/backend/uploadFile";
import { useState } from "react";
import PrimaryBtn from "./PrimaryBtn";

export default function FileInput({
  fileUrl = "",
  setFileUrl,
}: {
  fileUrl?: string;
  setFileUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const [fileName, setFileName] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
  const [status, setStatus] = useState<
    "loading" | "uploaded" | "failed" | "idle"
  >("idle");

  const handleOnFileChange = (e: any) => {
    const files = e.currentTarget.files;

    const reader = new FileReader();
    if (files[0]) {
      reader.readAsDataURL(files[0]);
    } else {
      return;
    }
    reader.onload = (readerEvent: any) => {
      const result = readerEvent.target.result;
      setFileName(files[0].name);
      setSelectedImageFile(result);
      setStatus("idle");
      console.log(result);
    };
  };

  const handleOnFileUpload = async (e: any) => {
    e.preventDefault();
    if (selectedImageFile) {
      setStatus("loading");
      const { url, status } = await uploadFile(
        "courses",
        fileName,
        selectedImageFile
      );
      if (status === "fail") setStatus("failed");
      else if (status === "ok") {
        console.log(url);
        setFileUrl(url);
        setStatus("uploaded");
      }
    }
  };

  return (
    <div className="w-full px-3 mb-8 flex flex-col items-end gap-2">
      <label
        className="cursor-pointer flex w-full flex-col items-center justify-center rounded-lg bg-slate-300 dark:bg-slate-600 p-6 text-center"
        htmlFor="dropzone-file"
      >
        {fileUrl !== "" && <img src={fileUrl} className="w-44 mb-5" />}
        {fileName !== "" && selectedImageFile !== null ? (
          <img src={selectedImageFile} className="w-80 mb-5" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        )}

        <h2 className="mt-4 text-xl font-burbankblack tracking-widest uppercase">
          Course Image
        </h2>

        <p className="mt-2 font-burbankmedium text-sm text-gray-500 dark:text-gray-400 tracking-wide">
          Upload or drag & drop your file JPG only.{" "}
        </p>

        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          name="category_image"
          accept="image/jpeg"
          onChange={handleOnFileChange}
        />
      </label>
      <PrimaryBtn handleOnClick={handleOnFileUpload} size="sm" status={status}>
        Upload File
      </PrimaryBtn>
    </div>
  );
}
