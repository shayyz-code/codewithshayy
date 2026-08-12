import { spec } from "../api/v1/spec"

// A constant. It reads no database and no filesystem, so unlike the endpoints it
// describes there is nothing here to bake in wrongly at build time.
export const dynamic = "force-static"

export function GET() {
  return new Response(`${JSON.stringify(spec, null, 2)}\n`, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600",
    },
  })
}
