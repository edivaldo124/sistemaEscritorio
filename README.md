# MFV Advocacia — site e sistema de gestão (Sousa – PB)

Projeto da atividade *Do briefing ao site multipágina com IA*. Reúne:

1. **Site público** (Flask + Jinja, CSS e JavaScript sem dependências): Início, Áreas de atuação, O escritório e Contato.
2. **Sistema interno de gestão** (clientes, processos, agenda, documentos, relatórios, mural), atrás da "Área restrita da equipe".

O negócio é o escritório real **Melo Fernandes & Vasconcelos Advocacia (MFV)**. Este **não é o site oficial**: o oficial é <https://mfv.adv.br>. Logotipo, fotos e vídeos pertencem ao escritório.

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [briefing.md](briefing.md) | Negócio, público, objetivo, proposta de valor, CTA |
| [mapa-site.md](mapa-site.md) | Páginas, seções e ação esperada em cada uma |
| [conteudo.md](conteudo.md) | Textos finais e a **fonte de cada fato** |
| [design-system.md](design-system.md) | Referência visual (não alterar) |
| [auditoria.md](auditoria.md) | Auditoria, 4 ciclos de refinamento e pendências |
| [mapa-do-projeto.md](mapa-do-projeto.md) | Pastas e responsabilidades |

## Dados do escritório (conferidos em 06/11/2026)

Fontes: site oficial, cadastro público de CNPJ, Diário Eletrônico da OAB e Diário da Justiça da Paraíba. Detalhes e divergências em [conteudo.md](conteudo.md).

- **Razão social:** Melo Fernandes & Vasconcelos - Advogados Associados · **CNPJ** 22.233.391/0001-27
- **Sócios-fundadores:** Dra. Bárbara de Melo Fernandes Vasconcelos (OAB/PB 19.571) e Dr. Higor Vasconcelos de Almeida (OAB/PB 19.503)
- **Endereço:** Rua Lafaiete Píres Ferreira, 35, Centro, Sousa/PB, CEP 58800-510
- **Contato:** WhatsApp e telefone (83) 98122-9292 · contato@mfv.adv.br · Instagram @mfvadvogados
- **Atendimento:** segunda a sexta-feira, 07h30–12h00 e 13h30–18h00

## Como executar

```bash
pip install -r requirements.txt

# Site e sistema (http://127.0.0.1:5000). Para não tocar em prisma/dev.db, use um banco de teste:
PYTHON_DATABASE_URL=sqlite:////tmp/mfv-teste.db python3 -m flask --app servidor run

# Testes
python3 -m unittest discover -s backend/tests -v
npx jest --watchAll=false
```

## Observações importantes

- A **área interna abre sem login** (quem não está autenticado é tratado como sócia administradora). Não hospede com dados reais sem corrigir. Veja a seção 5 de [auditoria.md](auditoria.md).
- As pastas `app/`, `components/`, `lib/` e `prisma/` são uma interface alternativa em Next.js, **não redesenhada** e com dados anteriores à correção.
- O site não usa cookies de rastreamento, análise de audiência nem fontes de terceiros.
