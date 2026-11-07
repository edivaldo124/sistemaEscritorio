import { forwardToPythonBackend } from "@/lib/python-backend";

export async function GET(request: Request) {
  return forwardToPythonBackend(request, "/api/documentos");
}

export async function POST(request: Request) {
  return forwardToPythonBackend(request, "/api/documentos");
}

export async function DELETE(request: Request) {
  return forwardToPythonBackend(request, "/api/documentos");
}
