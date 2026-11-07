import { forwardToPythonBackend } from "@/lib/python-backend";

export async function POST(request: Request) {
  return forwardToPythonBackend(request, "/api/auth/login");
}
