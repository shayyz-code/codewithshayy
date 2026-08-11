"use client"

import ProjectsContextProvider from "@/context/projectsContext"
import Canvas3 from "./Canvas3"

// Bundled together so Home and Me can pull this whole subtree in with
// next/dynamic({ ssr: false }).
//
// Everything under here reaches Firestore through projectsContext, and
// importing `firebase/firestore` at all drags in protobufjs, which generates
// code with `new Function` at import time — forbidden on Workers. Keeping the
// import dynamic and client-only is what stops it entering the server bundle.
//
// This wrapper goes away with the move to D1: server components read the
// database directly and no Firebase code ships to the browser at all.
export default function ProjectsSection() {
  return (
    <ProjectsContextProvider>
      <Canvas3 />
    </ProjectsContextProvider>
  )
}
