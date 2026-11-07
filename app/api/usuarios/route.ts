import { forwardToPythonBackend } from "@/lib/python-backend";

export async function GET(request: Request) {
  return forwardToPythonBackend(request, "/api/usuarios");
}

export async function POST(request: Request) {
  return forwardToPythonBackend(request, "/api/usuarios");
}

export async function PATCH(request: Request) {
  return forwardToPythonBackend(request, "/api/usuarios");
}
