"use client";

import editCourse from "@/backend/editCourse";
import getAllFromCourse from "@/backend/getAllFromCourse";
import { ContextEditCourse } from "@/context/editCourseContext";
import FileInput from "@/ui/FileInput";
import PrimaryBtn from "@/ui/PrimaryBtn";
import TextArea from "@/ui/TextArea";
import TextInput from "@/ui/TextInput";
import { useContext, useEffect, useState } from "react";

export default function EditCourse() {
  const { key } = useContext(ContextEditCourse);
  const [title, setTitle] = useState<string>("");
  const [taughtby, setTaughtby] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [overview, setOverview] = useState<string>("");
  const [prerequisites, setPrerequisites] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [techstacks, setTechstacks] = useState<string>("");
  const [techstacksdescription, setTechstacksdescription] =
    useState<string>("");
  const [whatwillilearn, setWhatwillilearn] = useState<string>("");
  const [whatwillibuild, setWhatwillibuild] = useState<string>("");
  const [isthiscourserightforme, setIsthiscourserightforme] =
    useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [photo_url, setPhoto_url] = useState<string | undefined>("");
  const [status, setStatus] = useState<
    "loading" | "uploaded" | "failed" | "idle"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    if (!photo_url) {
      setStatus("idle");
      console.log("photo is required.");
      return;
    }
    if (
      !title ||
      !taughtby ||
      !description ||
      !slug ||
      !overview ||
      !prerequisites ||
      !tags ||
      !techstacks ||
      !techstacksdescription ||
      !whatwillibuild ||
      !whatwillilearn ||
      !isthiscourserightforme
    ) {
      setStatus("idle");
      return;
    } else {
      const res = await editCourse({
        key: key,
        title,
        taughtby,
        description,
        slug,
        overview,
        prerequisites,
        tags,
        techstacks,
        techstacksdescription,
        whatwillilearn,
        whatwillibuild,
        isthiscourserightforme,
        duration,
        photo_url,
      });
      if (res.status === "fail") {
        console.log("Failed");
        setStatus("failed");
      } else if (res.status === "ok") {
        console.log("Course details edited at " + res.docId);
        setStatus("uploaded");
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getAllFromCourse("courses", key);
      if (data) {
        setTitle(data.title);
        setTaughtby(data.taughtby);
        setDescription(data.description);
        setSlug(data.slug);
        setOverview(data.overview);
        setPrerequisites(data.prerequisites);
        setTags(data.tags);
        setTechstacks(data.techstacks);
        setTechstacksdescription(data.techstacksdescription);
        setWhatwillilearn(data.whatwillilearn);
        setWhatwillibuild(data.whatwillibuild);
        setIsthiscourserightforme(data.isthiscourserightforme);
        setDuration(data.duration);
        setPhoto_url(data.photo_url);
      }
    }
    fetchData();
  }, [key]);
  return (
    <div className="w-full lg:w-1/3 m-1">
      <form
        className="w-full bg-white/70 dark:bg-black/30 shadow-md p-6 rounded-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-wrap -mx-3 mb-6 gap-2">
          <div className="p-3 flex gap-2 items-center">
            <h2 className="font-burbankblack tracking-widest text-xl uppercase">
              &gt;&gt; Editing
            </h2>
            <span className="bg-secondary/60 px-2 rounded-md text-sm font-burbankmedium">
              {key}
            </span>
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="Title"
              labelForVal="title"
              value={title}
              setValue={setTitle}
            />
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="Taught by"
              labelForVal="taughtby"
              value={taughtby}
              setValue={setTaughtby}
            />
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="Description"
              labelForVal="description"
              value={description}
              setValue={setDescription}
            />
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="Slug"
              labelForVal="slug"
              value={slug}
              setValue={setSlug}
            />
          </div>
          <div className="w-full px-3">
            <TextArea
              labelVal="Overview"
              labelForVal="overview"
              value={overview}
              setValue={setOverview}
            />
          </div>

          <div className="w-full px-3">
            <TextArea
              labelVal="Prerequisites"
              labelForVal="prerequisites"
              value={prerequisites}
              setValue={setPrerequisites}
            />
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="Tech Stacks"
              labelForVal="techstacks"
              value={techstacks}
              setValue={setTechstacks}
            />
          </div>
          <div className="w-full px-3">
            <TextArea
              labelVal="Tech Stacks Description"
              labelForVal="techstacksdescription"
              value={techstacksdescription}
              setValue={setTechstacksdescription}
            />
          </div>

          <div className="w-full px-3">
            <TextArea
              labelVal="What will I learn?"
              labelForVal="whatwillilearn"
              value={whatwillilearn}
              setValue={setWhatwillilearn}
            />
          </div>
          <div className="w-full px-3">
            <TextArea
              labelVal="What will I build?"
              labelForVal="whatwillibuild"
              value={whatwillibuild}
              setValue={setWhatwillibuild}
            />
          </div>
          <div className="w-full px-3">
            <TextArea
              labelVal="Is this course right for me?"
              labelForVal="isthiscourserightforme"
              value={isthiscourserightforme}
              setValue={setIsthiscourserightforme}
            />
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="How long will the course take?"
              labelForVal="duration"
              value={duration}
              setValue={setDuration}
            />
          </div>
          <div className="w-full md:w-full px-3 pb-1">
            <TextInput
              type="text"
              labelVal="Tags"
              labelForVal="tags"
              value={tags}
              setValue={setTags}
            />
          </div>

          <FileInput fileUrl={photo_url} setFileUrl={setPhoto_url} />
        </div>
        <PrimaryBtn type="submit" size="md" status={status}>
          Submit
        </PrimaryBtn>
      </form>
    </div>
  );
}
