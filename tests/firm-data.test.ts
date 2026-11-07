import { describe, it, expect } from "@jest/globals";
import { FIRM_DATA, DOCUMENT_TEMPLATES } from "@/lib/firm-data";
import { maskCpfCnpj, maskCnj } from "@/lib/utils";

describe("MFV Advocacia (Sousa - PB) — Integridade de Dados Institucionais", () => {
  it("contém os dados oficiais verificados de Melo Fernandes & Vasconcelos - Advogados Associados", () => {
    expect(FIRM_DATA.nomeFantasia).toBe("MFV Advocacia");
    expect(FIRM_DATA.razaoSocial).toBe("Melo Fernandes & Vasconcelos - Advogados Associados");
    expect(FIRM_DATA.cnpj).toBe("22.233.391/0001-27");
    expect(FIRM_DATA.endereco.cidade).toBe("Sousa");
    expect(FIRM_DATA.endereco.uf).toBe("PB");
    expect(FIRM_DATA.endereco.cep).toBe("58800-510");
  });

  it("lista os sócios-fundadores reais inscritos na OAB/PB", () => {
    const oabs = FIRM_DATA.sociosFundadores.map((s) => s.oab);
    expect(oabs).toContain("OAB/PB 19.571");
    expect(oabs).toContain("OAB/PB 19.503");
  });

  it("gera minutas jurídicas oficiais com os dados reais da banca em Sousa - PB", () => {
    const procuracao = DOCUMENT_TEMPLATES[0].gerarConteudo({
      clienteNome: "Constituinte Teste",
      clienteDocumento: "123.456.789-00",
      clienteEndereco: "Centro",
      clienteCidadeUf: "Sousa – PB",
      dataExtenso: "06 de novembro de 2026",
    });
    expect(procuracao).toContain("MELO FERNANDES & VASCONCELOS - ADVOGADOS ASSOCIADOS");
    expect(procuracao).toContain("22.233.391/0001-27");
    expect(procuracao).toContain("19.571");
    expect(procuracao).toContain("19.503");
  });

  it("formata CPF, CNPJ e número CNJ corretamente", () => {
    expect(maskCpfCnpj("12345678901")).toBe("123.456.789-01");
    expect(maskCpfCnpj("22233391000127")).toBe("22.233.391/0001-27");
    expect(maskCnj("08001234520268150370")).toBe("0800123-45.2026.8.15.0370");
  });
});
