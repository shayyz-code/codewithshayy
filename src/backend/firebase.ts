import { initializeApp, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  // No storageBucket: Firebase Storage went with uploadFile.ts. The env var was
  // misspelled NEXT_PUBLIC_STORAGE_BACKET anyway, so it was always undefined.
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
}

// Initialised lazily rather than at module scope. OpenNext bundles every route
// into a single worker, so a module-scope initializeApp() ran during isolate
// evaluation and took down routes that never touch Firebase. Firestore's
// protobufjs dependency also generates code with `new Function`, which Workers
// forbids — so this must only ever run in the browser.
let app: FirebaseApp | undefined
let db: Firestore | undefined

export function getDb(): Firestore {
  app ??= initializeApp(firebaseConfig)
  return (db ??= getFirestore(app))
}
