/**
 * Dados públicos oficiais e verificados do escritório de referência em Sousa - PB
 * e dos órgãos judiciários reais da Comarca e Subseção de Sousa - PB.
 * Nenhuma informação fictícia ou alucinada.
 */

export const FIRM_DATA = {
  nomeFantasia: "MFV Advocacia",
  razaoSocial: "Melo Fernandes & Vasconcelos - Advogados Associados",
  cnpj: "22.233.391/0001-27",
  inscricaoOabSociedade: "OAB/PB — Sociedade de Advogados",
  endereco: {
    logradouro: "Rua Lafayette Pires Ferreira, nº 35",
    bairro: "Centro",
    cidade: "Sousa",
    uf: "PB",
    cep: "58800-510",
    completo: "Rua Lafayette Pires Ferreira, 35 – Centro, Sousa – PB, CEP 58800-510",
  },
  contatos: {
    emailGeral: "contato@mfv.adv.br",
    emailSocia: "barbara@mfv.adv.br",
    telefonePrincipal: "+55 (83) 98122-9292",
    telefoneSecundario: "+55 (83) 8804-0135",
    website: "https://mfv.adv.br",
    dominio: "mfv.adv.br",
  },
  sociosFundadores: [
    {
      id: "socio-barbara",
      nome: "Dra. Bárbara de Melo Fernandes Vasconcelos",
      nomeCurto: "Dra. Bárbara de Melo Fernandes",
      oab: "OAB/PB 19.571",
      cargo: "Sócia-Fundadora",
      role: "SOCIO" as const,
      email: "barbara@mfv.adv.br",
      telefone: "+55 (83) 98122-9292",
      atuacaoInstitucional:
        "Advogada inscrita na OAB/PB sob o nº 19.571, com histórico de atuação na diretoria da Subseção da OAB de Sousa-PB (ex-Vice-Presidente).",
      areasFoco: [
        "Assessoria Jurídica Empresarial",
        "Direito Cível",
        "Direito do Consumidor",
        "Direito de Família e Sucessões",
        "Direito da Saúde",
      ],
    },
    {
      id: "socio-higor",
      nome: "Dr. Higor Vasconcelos de Almeida",
      nomeCurto: "Dr. Higor Vasconcelos",
      oab: "OAB/PB 19.503",
      cargo: "Sócio-Fundador",
      role: "SOCIO" as const,
      email: "higor@mfv.adv.br",
      telefone: "+55 (83) 8804-0135",
      atuacaoInstitucional:
        "Advogado inscrito na OAB/PB sob o nº 19.503, integrante do Tribunal de Ética e Disciplina (TED) da OAB-PB.",
      areasFoco: [
        "Direito Administrativo e Servidores Públicos",
        "Execuções contra a Fazenda Pública",
        "Direito Previdenciário (RGPS e RPPS)",
        "Direito Tributário",
        "Contencioso Cível Estratégico",
      ],
    },
  ],
  areasAtuacao: [
    {
      codigo: "EMPRESARIAL",
      titulo: "Assessoria Jurídica Empresarial",
      esfera: "Consultivo & Contencioso",
      descricao:
        "Apoio jurídico estratégico à tomada de decisão empresarial, revisão contratual, governança societária, prevenção de passivos e contencioso estratégico para empresas de Sousa e do Alto Sertão Paraibano.",
    },
    {
      codigo: "ADMINISTRATIVO",
      titulo: "Direito Administrativo e Fazenda Pública",
      esfera: "Estadual, Municipal & Federal",
      descricao:
        "Defesa de direitos de servidores públicos, processos administrativos disciplinares, licitações, execuções contra a Fazenda Pública e revisão de aposentadorias e pensões.",
    },
    {
      codigo: "CIVEL",
      titulo: "Direito Cível e Obrigações",
      esfera: "TJPB & Tribunais Superiores",
      descricao:
        "Responsabilidade civil, posse e propriedade, contratos civis, cobranças, indenizações e tutela específica perante as Varas Mistas da Comarca de Sousa/PB.",
    },
    {
      codigo: "PREVIDENCIARIO",
      titulo: "Direito Previdenciário",
      esfera: "INSS, JEF/TRF-5 & RPPS",
      descricao:
        "Concessão e revisão de aposentadorias, benefícios por incapacidade, pensão por morte e planejamento previdenciário perante a Subseção Judiciária Federal de Sousa/PB.",
    },
    {
      codigo: "CONSUMIDOR",
      titulo: "Direito do Consumidor e Saúde",
      esfera: "Juizado Especial & Justiça Comum",
      descricao:
        "Tutelas de urgência em saúde suplementar e pública, práticas abusivas bancárias, responsabilidade pelo fato e vício do produto ou serviço.",
    },
    {
      codigo: "TRIBUTARIO_TRABALHISTA",
      titulo: "Direito Tributário, Trabalhista e Família",
      esfera: "TRT-13, TJPB & TRF-5",
      descricao:
        "Planejamento e defesas fiscais, contencioso trabalhista patronal e obreiro na Vara do Trabalho de Sousa (TRT-13), inventários e sucessões.",
    },
  ],
  orgaosJudiciariosSousa: [
    {
      sigla: "TJPB — Comarca de Sousa",
      nome: "Tribunal de Justiça do Estado da Paraíba — Comarca de Sousa",
      esfera: "Justiça Estadual (PJe 1º e 2º Grau)",
      localizacao: "Fórum Dr. José Mariz — Sousa/PB",
      varas: [
        "1ª Vara Mista de Sousa",
        "2ª Vara Mista de Sousa",
        "3ª Vara Mista de Sousa",
        "4ª Vara Mista de Sousa",
        "5ª Vara Mista de Sousa",
        "6ª Vara Mista de Sousa",
        "7ª Vara Mista de Sousa",
        "Juizado Especial Misto de Sousa",
      ],
    },
    {
      sigla: "TRT-13 — Vara do Trabalho de Sousa",
      nome: "Tribunal Regional do Trabalho da 13ª Região — Vara do Trabalho de Sousa",
      esfera: "Justiça do Trabalho (PJe-JT)",
      localizacao: "Fórum José Facundo — Rua José Facundo de Lira, nº 30, Gato Preto, Sousa – PB (vtsou@trt13.jus.br)",
      varas: [
        "Vara Única do Trabalho de Sousa — TRT-13",
        "CEJUSC-JT de Sousa — TRT-13",
      ],
    },
    {
      sigla: "TRF-5 / SJPB — Subseção de Sousa",
      nome: "Justiça Federal na Paraíba (TRF da 5ª Região) — Subseção Judiciária de Sousa",
      esfera: "Justiça Federal (PJe Federal / Creta)",
      localizacao:
        "Fórum Des. Federal Paulo de Tarso Benevides Gadelha — Rua Francisco Vieira da Costa, nº 20, Bairro Maria Rachel, Sousa – PB",
      varas: [
        "8ª Vara Federal — Subseção Judiciária de Sousa/PB",
        "Juizado Especial Federal Adjunto — Sousa/PB",
      ],
    },
    {
      sigla: "OAB/PB — Subseção de Sousa",
      nome: "Ordem dos Advogados do Brasil — Seccional Paraíba (Subseção de Sousa)",
      esfera: "Órgão de Classe / Ética e Prerrogativas",
      localizacao: "Sousa – PB",
      varas: [
        "Conselho Subsecional de Sousa/PB",
        "Tribunal de Ética e Disciplina (TED — OAB/PB)",
      ],
    },
  ],
};

export interface TemplateContext {
  clienteNome: string;
  clienteDocumento: string;
  clienteRgOuIe?: string;
  clienteEstadoCivil?: string;
  clienteProfissao?: string;
  clienteEndereco: string;
  clienteCidadeUf: string;
  processoNumero?: string;
  processoOrgao?: string;
  processoObjeto?: string;
  valorHonorarios?: string;
  dataExtenso: string;
}

export const DOCUMENT_TEMPLATES = [
  {
    id: "procuracao-ad-judicia",
    titulo: "Procuração Ad Judicia et Extra",
    categoria: "PROCURACAO",
    descricao:
      "Instrumento de mandato judicial e extrajudicial com qualificação oficial dos sócios da MFV Advocacia (OAB/PB 19.571 e OAB/PB 19.503) e endereço profissional em Sousa/PB.",
    gerarConteudo: (ctx: TemplateContext) => `PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE:
${ctx.clienteNome}, ${ctx.clienteDocumento.length > 14 ? "pessoa jurídica de direito privado, inscrita no CNPJ" : `${ctx.clienteEstadoCivil || "civilmente capaz"}, ${ctx.clienteProfissao || "profissão declarada nos autos"}, inscrito(a) no CPF`} sob o nº ${ctx.clienteDocumento}${ctx.clienteRgOuIe ? `, RG/IE nº ${ctx.clienteRgOuIe}` : ""}, com domicílio e endereço em ${ctx.clienteEndereco}, ${ctx.clienteCidadeUf}.

OUTORGADOS:
DRA. BÁRBARA DE MELO FERNANDES VASCONCELOS, brasileira, advogada regularmente inscrita na OAB/PB sob o nº 19.571, e DR. HIGOR VASCONCELOS DE ALMEIDA, brasileiro, advogado regularmente inscrito na OAB/PB sob o nº 19.503, integrantes da sociedade de advogados MELO FERNANDES & VASCONCELOS - ADVOGADOS ASSOCIADOS (MFV ADVOCACIA), inscrita no CNPJ sob o nº 22.233.391/0001-27, com sede profissional na Rua Lafayette Pires Ferreira, nº 35, Centro, Sousa – PB, CEP 58800-510, endereço eletrônico contato@mfv.adv.br e telefone +55 (83) 98122-9292, onde recebem intimações e notificações de estilo.

PODERES:
Pelo presente instrumento particular de mandato, a parte OUTORGANTE nomeia e constitui os OUTORGADOS seus bastantes procuradores, conferindo-lhes os poderes da cláusula "ad judicia et extra", para o foro em geral, perante qualquer Juízo, Instância ou Tribunal (em especial perante a Comarca de Sousa – TJPB, Vara do Trabalho de Sousa – TRT-13 e Subseção Judiciária de Sousa – TRF-5), bem como repartições públicas, autarquias e entidades privadas, podendo propor as ações competentes, contestar, recorrer, apresentar contrarrazões, acompanhar processos administrativos e judiciais, bem como os poderes especiais previstos no art. 105 do Código de Processo Civil para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromissos, assinar declaração de hipossuficiência econômica e substabelecer com ou sem reservas de iguais poderes.

FINALIDADE ESPECÍFICA:
${ctx.processoObjeto || "Defesa dos interesses jurídicos da parte outorgante"}${ctx.processoNumero ? ` — Processo nº ${ctx.processoNumero}` : ""}${ctx.processoOrgao ? ` (${ctx.processoOrgao})` : ""}.

Sousa – PB, ${ctx.dataExtenso}.


___________________________________________________________
${ctx.clienteNome}
Outorgante`,
  },
  {
    id: "contrato-honorarios",
    titulo: "Contrato de Prestação de Serviços Advocatícios e Honorários",
    categoria: "CONTRATO_HONORARIOS",
    descricao:
      "Minuta contratual formal celebrada com Melo Fernandes & Vasconcelos - Advogados Associados (CNPJ 22.233.391/0001-27), regida pelo Estatuto da Advocacia (Lei nº 8.906/94), com foro em Sousa/PB.",
    gerarConteudo: (ctx: TemplateContext) => `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS

CONTRATANTE:
${ctx.clienteNome}, CPF/CNPJ nº ${ctx.clienteDocumento}, residente/sediado(a) em ${ctx.clienteEndereco}, ${ctx.clienteCidadeUf}.

CONTRATADA:
MELO FERNANDES & VASCONCELOS - ADVOGADOS ASSOCIADOS (MFV ADVOCACIA), sociedade de advogados inscrita no CNPJ sob o nº 22.233.391/0001-27, sediada na Rua Lafayette Pires Ferreira, nº 35, Centro, Sousa – PB, CEP 58800-510, neste ato representada por seus sócios fundadores DRA. BÁRBARA DE MELO FERNANDES VASCONCELOS (OAB/PB 19.571) e DR. HIGOR VASCONCELOS DE ALMEIDA (OAB/PB 19.503).

CLÁUSULA PRIMEIRA — DO OBJETO
O presente instrumento tem como objeto a prestação de serviços jurídicos técnico-profissionais pela CONTRATADA em favor da parte CONTRATANTE, consistindo especificamente em: ${ctx.processoObjeto || "patrocínio jurídico consultivo e/ou contencioso conforme demanda especificada"}${ctx.processoNumero ? `, vinculado aos autos nº ${ctx.processoNumero}` : ""}${ctx.processoOrgao ? `, perante ${ctx.processoOrgao}` : ""}.

CLÁUSULA SEGUNDA — DOS HONORÁRIOS CONVENCIONADOS
Pelos serviços profissionais ora ajustados, a parte CONTRATANTE pagará à CONTRATADA o valor de ${ctx.valorHonorarios || "conforme tabela da OAB/PB e proposta financeira anexa"}, nos termos do art. 22 da Lei Federal nº 8.906/1994 (Estatuto da Advocacia e da OAB).
Parágrafo Único: Os honorários de sucumbência eventualmente arbitrados pelo Juízo pertencem integral e exclusivamente aos advogados da CONTRATADA, sem prejuízo dos honorários contratuais ora pactuados.

CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DAS PARTES
Compete à CONTRATADA empregar todo o zelo, diligência e técnica jurídica na condução da demanda, tratando-se de obrigação de meio e não de resultado. Compete ao(à) CONTRATANTE fornecer tempestivamente todos os documentos verídicos necessários à instrução da causa e manter seus dados cadastrais atualizados.

CLÁUSULA QUARTA — DO FORO
Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o Foro da Comarca de Sousa, Estado da Paraíba, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

Sousa – PB, ${ctx.dataExtenso}.


___________________________________________________________
${ctx.clienteNome} — CONTRATANTE


___________________________________________________________
MELO FERNANDES & VASCONCELOS - ADVOGADOS ASSOCIADOS
CNPJ 22.233.391/0001-27
Dra. Bárbara de Melo Fernandes (OAB/PB 19.571)
Dr. Higor Vasconcelos de Almeida (OAB/PB 19.503)`,
  },
  {
    id: "declaracao-hipossuficiencia",
    titulo: "Declaração de Hipossuficiência Econômica (Art. 98 e 99 do CPC)",
    categoria: "DECLARACAO",
    descricao:
      "Declaração formal para requerimento dos benefícios da Justiça Gratuita perante a Comarca ou Subseção Judiciária de Sousa/PB.",
    gerarConteudo: (ctx: TemplateContext) => `DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA
(Arts. 98 e 99 da Lei nº 13.105/2015 — Código de Processo Civil e Art. 5º, LXXIV, da Constituição Federal)

Eu, ${ctx.clienteNome}, inscrito(a) no CPF sob o nº ${ctx.clienteDocumento}${ctx.clienteRgOuIe ? `, portador(a) do RG nº ${ctx.clienteRgOuIe}` : ""}, residente e domiciliado(a) em ${ctx.clienteEndereco}, ${ctx.clienteCidadeUf}, DECLARO, para os devidos fins de direito e sob as penas da lei, perante ${ctx.processoOrgao || "o Juízo competente da Comarca/Subseção de Sousa – PB"}, que não possuo condições financeiras de arcar com o pagamento das custas processuais, taxas judiciárias e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.

Por ser expressão da verdade, firmo a presente declaração para que produza seus regulares efeitos legais, requerendo a concessão dos benefícios da Gratuidade da Justiça.

Sousa – PB, ${ctx.dataExtenso}.


___________________________________________________________
${ctx.clienteNome}
CPF: ${ctx.clienteDocumento}

Assessoria Jurídica:
MFV Advocacia — Melo Fernandes & Vasconcelos Advogados Associados
Rua Lafayette Pires Ferreira, 35 – Centro, Sousa – PB, CEP 58800-510`,
  },
];
