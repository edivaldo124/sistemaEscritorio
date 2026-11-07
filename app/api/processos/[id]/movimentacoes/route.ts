import { forwardToPythonBackend } from "@/lib/python-backend";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return forwardToPythonBackend(request, `/api/processos/${id}/movimentacoes`);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return forwardToPythonBackend(request, `/api/processos/${id}/movimentacoes`);
}
