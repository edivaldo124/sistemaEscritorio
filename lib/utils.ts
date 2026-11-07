import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(value: number | null | undefined): string {
  const num = Number(value ?? 0);
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTimeBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateExtensoBR(dateInput: Date = new Date()): string {
  return dateInput.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function maskCnj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 20);
  let out = digits;
  if (digits.length > 7) out = `${digits.slice(0, 7)}-${digits.slice(7)}`;
  if (digits.length > 9) out = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
  if (digits.length > 13)
    out = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
  if (digits.length > 14)
    out = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`;
  if (digits.length > 16)
    out = `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`;
  return out;
}
