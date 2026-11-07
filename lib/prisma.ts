import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  seededInstitutional: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Garante que os membros reais da banca MFV Advocacia (Sousa - PB)
 * estejam registrados na tabela de usuários do sistema sem inserir
 * nenhum cliente ou processo fictício.
 */
export async function ensureInstitutionalUsers() {
  if (globalForPrisma.seededInstitutional) return;
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      await prisma.user.createMany({
        data: [
          {
            name: "Dra. Bárbara de Melo Fernandes Vasconcelos",
            email: "barbara@mfv.adv.br",
            oab: "OAB/PB 19.571",
            role: "SOCIO",
            cargo: "Sócia-Fundadora",
            especialidade: "Assessoria Empresarial, Direito Cível, Consumidor e Família",
            telefone: "+55 (83) 98122-9292",
            ativo: true,
          },
          {
            name: "Dr. Higor Vasconcelos de Almeida",
            email: "higor@mfv.adv.br",
            oab: "OAB/PB 19.503",
            role: "SOCIO",
            cargo: "Sócio-Fundador",
            especialidade: "Direito Administrativo, Previdenciário, Cível e Tributário",
            telefone: "+55 (83) 8804-0135",
            ativo: true,
          },
          {
            name: "Secretaria & Atendimento — MFV Advocacia",
            email: "contato@mfv.adv.br",
            oab: null,
            role: "ASSISTENTE",
            cargo: "Coordenação Administrativa e Protocolo",
            especialidade: "Atendimento, Triagem Documental e Pauta de Audiências (Sousa/PB)",
            telefone: "+55 (83) 98122-9292",
            ativo: true,
          },
        ],
      });
    }
    globalForPrisma.seededInstitutional = true;
  } catch {
    // Caso o banco ainda esteja sendo inicializado
  }
}
