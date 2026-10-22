import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: error.issues[0]?.message ?? "Validation failed",
        issues: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
