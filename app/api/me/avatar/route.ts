import { NextRequest, NextResponse } from "next/server";
import { requireAppAuthContext, RouteAuthError } from "@/lib/server-auth";
import { validateAvatarFile } from "@/lib/avatar-upload";
import { replaceUserAvatar } from "@/lib/avatar-storage";

/**
 * Lets the signed-in member replace their own profile picture. Only the
 * caller's own row is ever touched, so no admin permission is required.
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAppAuthContext();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Attach the image as the `file` form field." },
        { status: 400 },
      );
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const user = await replaceUserAvatar(authContext.appUser.id, file);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json(error.toResponseBody(), { status: error.status });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload profile picture.",
      },
      { status: 500 },
    );
  }
}
