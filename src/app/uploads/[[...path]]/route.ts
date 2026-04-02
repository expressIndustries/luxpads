import { readFile } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUploadsRoot, mimeForUploadExtension } from "@/lib/uploads-path";

/**
 * Serves files under the uploads root (same path `saveUploadedImage` writes to).
 * Ensures `/uploads/...` works for runtime uploads in standalone Docker and when
 * files live outside `public/` via `LUXPADS_UPLOADS_ROOT`.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<NextResponse> {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (segments.some((s) => s === ".." || s.includes("/") || s.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const root = path.resolve(getUploadsRoot());
  const resolved = path.resolve(root, ...segments);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(resolved);
    const ext = path.extname(resolved);
    const contentType = mimeForUploadExtension(ext);
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
