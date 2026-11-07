import { forwardToPythonBackend } from "@/lib/python-backend";

export async function GET(request: Request) {
  return forwardToPythonBackend(request, "/api/processos");
}

export async function POST(request: Request) {
  return forwardToPythonBackend(request, "/api/processos");
}
