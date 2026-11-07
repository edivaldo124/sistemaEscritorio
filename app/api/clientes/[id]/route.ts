import { forwardToPythonBackend } from "@/lib/python-backend";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return forwardToPythonBackend(request, `/api/clientes/${id}`);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return forwardToPythonBackend(request, `/api/clientes/${id}`);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return forwardToPythonBackend(request, `/api/clientes/${id}`);
}
