import { forwardToPythonBackend } from "@/lib/python-backend";

export async function GET(request: Request) {
  return forwardToPythonBackend(request, "/api/chat");
}

export async function POST(request: Request) {
  return forwardToPythonBackend(request, "/api/chat");
}

export async function PATCH(request: Request) {
  return forwardToPythonBackend(request, "/api/chat");
}

export async function DELETE(request: Request) {
  return forwardToPythonBackend(request, "/api/chat");
}
