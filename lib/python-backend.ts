import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5000";

interface PythonBridgeResult {
  status: number;
  headers?: {
    "X-Powered-By-Backend"?: string;
    "Set-Cookie"?: string | null;
  };
  body: unknown;
}

/**
 * Encaminha qualquer requisição da camada Next.js para o backend em Python
 * (Flask + SQLAlchemy 2.0 + Pydantic v2).
 *
 * 1. Tenta comunicação HTTP direta com o servidor Python (`http://127.0.0.1:5000`).
 * 2. Caso o daemon HTTP Python não esteja ativo em segundo plano, executa a
 *    aplicação WSGI Python diretamente via `python3 -m backend.cli`, garantindo
 *    que 100% das regras de negócio, validações Pydantic, RBAC e persistência
 *    SQLAlchemy rodem em Python.
 */
export async function forwardToPythonBackend(
  request: Request,
  overridePath?: string
): Promise<NextResponse> {
  const url = new URL(request.url);
  const pathAndQuery = overridePath
    ? `${overridePath}${url.search}`
    : `${url.pathname}${url.search}`;

  const method = request.method.toUpperCase();
  let rawBody = "";
  if (method !== "GET" && method !== "HEAD") {
    try {
      rawBody = await request.text();
    } catch {
      rawBody = "";
    }
  }

  const forwardedHeaders: Record<string, string> = {};
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) forwardedHeaders["Cookie"] = cookieHeader;
  const authHeader = request.headers.get("authorization");
  if (authHeader) forwardedHeaders["Authorization"] = authHeader;
  const roleHeader = request.headers.get("x-mfv-role");
  if (roleHeader) forwardedHeaders["X-MFV-Role"] = roleHeader;
  const emailHeader = request.headers.get("x-mfv-user-email");
  if (emailHeader) forwardedHeaders["X-MFV-User-Email"] = emailHeader;
  if (rawBody) forwardedHeaders["Content-Type"] = "application/json";

  // 1. Tenta servidor HTTP Python ativo em PYTHON_BACKEND_URL
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const httpRes = await fetch(`${PYTHON_BACKEND_URL}${pathAndQuery}`, {
      method,
      headers: forwardedHeaders,
      body: rawBody ? rawBody : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    const data = await httpRes.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: httpRes.status });
    response.headers.set(
      "X-Powered-By-Backend",
      httpRes.headers.get("X-Powered-By-Backend") ||
        "Python-Flask-SQLAlchemy-MFV"
    );
    const setCookie = httpRes.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("Set-Cookie", setCookie);
    }
    return response;
  } catch {
    // 2. Fallback automático para execução direta no motor WSGI Python
    try {
      const { stdout } = await execFileAsync(
        "python3",
        [
          "-m",
          "backend.cli",
          method,
          pathAndQuery,
          rawBody,
          JSON.stringify(forwardedHeaders),
        ],
        {
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024,
        }
      );

      const parsed: PythonBridgeResult = JSON.parse(stdout);
      const response = NextResponse.json(parsed.body ?? {}, {
        status: parsed.status || 200,
      });
      response.headers.set(
        "X-Powered-By-Backend",
        parsed.headers?.["X-Powered-By-Backend"] ||
          "Python-Flask-SQLAlchemy-MFV"
      );
      if (parsed.headers?.["Set-Cookie"]) {
        response.headers.set("Set-Cookie", parsed.headers["Set-Cookie"]);
      }
      return response;
    } catch (bridgeError) {
      console.error("[Python Backend Bridge Error]:", bridgeError);
      return NextResponse.json(
        {
          error:
            "Erro ao processar requisição no backend Python (Flask/SQLAlchemy).",
        },
        { status: 500 }
      );
    }
  }
}
