---
name: token-economy
description: Reduzir leituras, saídas e retrabalho quando o usuário pedir economia de tokens ou execução enxuta de uma tarefa de programação.
---

# Economia de tokens

Conclua o escopo solicitado com contexto suficiente para decisões corretas. Não prometa percentuais de economia nem sacrifique validação, segurança ou requisitos para reduzir consumo.

- Localize arquivos com `rg --files` e ocorrências com `rg -n` em diretórios relevantes. Se indisponível, use `find` e `grep`. Exclua dependências, builds e arquivos gerados das buscas comuns.
- Leia primeiro as instruções aplicáveis, os pontos de entrada e trechos relacionados à mudança. Amplie a leitura quando dependências ou dúvidas exigirem, sem despejar o repositório inteiro no contexto.
- Reutilize descobertas e resultados ainda válidos. Releia arquivos após mudanças relevantes; não repita buscas idênticas sem motivo.
- Agrupe leituras independentes. Mantenha operações dependentes em sequência. Evite delegação para tarefas pequenas; só delegue quando autorizado e quando o benefício justificar o contexto adicional.
- Limite saídas extensas de ferramentas, preservando erros e resumos. Se houver truncamento, recupere os trechos necessários antes de concluir.
- Carregue apenas skills e referências pertinentes à tarefa. Não configure carregamento de todas as skills em todo pedido.
- Faça verificações proporcionais à mudança e execute todos os checks exigidos pelo projeto. Amplie testes quando falhas ou riscos concretos justificarem.
- Apresente atualizações curtas e uma resposta final com resultado, validação e pendências reais. Não reproduza arquivos inteiros já salvos, salvo pedido do usuário.
- Em trabalho longo, mantenha um resumo compacto do objetivo, decisões, arquivos alterados, verificações e próximos passos quando necessário para continuidade.
- Não altere modelo, assinatura, permissões, hooks ou configurações globais para economizar tokens sem autorização específica.

Esta skill é personalizada e orienta o fluxo de trabalho. Ela não mede consumo nem garante redução de custos.
