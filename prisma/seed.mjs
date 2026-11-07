import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Configurando base institucional real: MFV Advocacia (Sousa - PB)...");

  // Apenas os dados reais e públicos dos sócios fundadores e canal institucional do escritório
  // Melo Fernandes & Vasconcelos - Advogados Associados (CNPJ 22.233.391/0001-27)
  // Nenhum cliente falso ou processo fictício é inserido.
  await prisma.user.upsert({
    where: { email: "barbara@mfv.adv.br" },
    update: {
      name: "Dra. Bárbara de Melo Fernandes Vasconcelos",
      oab: "OAB/PB 19.571",
      role: "SOCIO",
      cargo: "Sócia-Fundadora",
      especialidade: "Assessoria Empresarial, Direito Cível, Consumidor e Família",
      telefone: "+55 (83) 98122-9292",
      ativo: true,
    },
    create: {
      name: "Dra. Bárbara de Melo Fernandes Vasconcelos",
      email: "barbara@mfv.adv.br",
      oab: "OAB/PB 19.571",
      role: "SOCIO",
      cargo: "Sócia-Fundadora",
      especialidade: "Assessoria Empresarial, Direito Cível, Consumidor e Família",
      telefone: "+55 (83) 98122-9292",
      ativo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "higor@mfv.adv.br" },
    update: {
      name: "Dr. Higor Vasconcelos de Almeida",
      oab: "OAB/PB 19.503",
      role: "SOCIO",
      cargo: "Sócio-Fundador",
      especialidade: "Direito Administrativo, Previdenciário, Cível e Tributário",
      telefone: "+55 (83) 8804-0135",
      ativo: true,
    },
    create: {
      name: "Dr. Higor Vasconcelos de Almeida",
      email: "higor@mfv.adv.br",
      oab: "OAB/PB 19.503",
      role: "SOCIO",
      cargo: "Sócio-Fundador",
      especialidade: "Direito Administrativo, Previdenciário, Cível e Tributário",
      telefone: "+55 (83) 8804-0135",
      ativo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "contato@mfv.adv.br" },
    update: {
      name: "Secretaria & Atendimento — MFV Advocacia",
      oab: null,
      role: "ASSISTENTE",
      cargo: "Coordenação Administrativa e Protocolo",
      especialidade: "Atendimento, Triagem Documental e Pauta de Audiências (Sousa/PB)",
      telefone: "+55 (83) 98122-9292",
      ativo: true,
    },
    create: {
      name: "Secretaria & Atendimento — MFV Advocacia",
      email: "contato@mfv.adv.br",
      oab: null,
      role: "ASSISTENTE",
      cargo: "Coordenação Administrativa e Protocolo",
      especialidade: "Atendimento, Triagem Documental e Pauta de Audiências (Sousa/PB)",
      telefone: "+55 (83) 98122-9292",
      ativo: true,
    },
  });

  console.log("Base institucional configurada com sucesso (sem dados fictícios).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
