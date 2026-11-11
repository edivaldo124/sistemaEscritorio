# Mapa do site — MFV Advocacia

> **Papel deste arquivo** (roteiro, etapa 6): responde **O QUE será construído**. É o **único mapa** do projeto.
> Base: [briefing.md](briefing.md). Os textos finais e os CTAs de cada página estão em [conteudo.md](conteudo.md).
> A estrutura de pastas do código está em [README.md](README.md) e em [AGENTS.md](AGENTS.md).

## Estrutura

```
/                     Início
├─ /areas-de-atuacao  Áreas de atuação
├─ /escritorio        O escritório
├─ /contato           Contato
├─ /termos            Termos de uso            (rodapé)
├─ /privacidade       Privacidade e LGPD       (rodapé)
└─ /login             Área restrita da equipe  (rodapé; fora do site público)
```

Na hospedagem pública (`MODO_PUBLICO=true`) respondem só as páginas do site (Início, Áreas, O escritório, Contato, Termos e Privacidade). `/login` e o sistema interno dão erro 404.

Cabeçalho (todas as páginas): logo → Início · Áreas de atuação · O escritório · Contato · WhatsApp.
Rodapé (todas as páginas): logo e razão social, páginas, contato e horário, redes sociais, termos, privacidade e área restrita.

## Páginas

### 1. Início (`/`)

- **Função:** apresentar o escritório e dar confiança nos primeiros segundos.
- **Seções:** abertura curta (só na primeira página da aba) · trilho cinematográfico: o nome do escritório sobre a foto da equipe, que cresce até a tela cheia, e então três manchetes trocadas pela rolagem (atuação para empresas e pessoas · onde estamos · contato) · história em uma frase · números (anos, áreas, sócios) · índice das oito áreas · onde estamos · chamada final para contato.
- **Informação que deve aparecer:** nome, cidade, ano de instalação, endereço, horário.
- **Ação esperada:** falar pelo WhatsApp, ou seguir para o escritório e as áreas.

### 2. Áreas de atuação (`/areas-de-atuacao`)

- **Função:** mostrar em que o escritório pode ajudar.
- **Seções:** introdução · lista das oito áreas que o escritório destaca · convite para quem não encontrou a sua área.
- **Informação que deve aparecer:** nome de cada área e uma definição neutra do que ela abrange.
- **Ação esperada:** reconhecer o seu caso e entrar em contato.

### 3. O escritório (`/escritorio`)

- **Função:** dar rosto e história ao escritório.
- **Seções:** história e fundação · sócios-fundadores com número da OAB · eventos e conteúdo (palestras, blog, MFV Cast) · parceria.
- **Informação que deve aparecer:** quem fundou, quando, onde, como o escritório se comunica.
- **Ação esperada:** conhecer os sócios e falar com o escritório.

### 4. Contato (`/contato`)

- **Função:** tornar o primeiro contato fácil.
- **Seções:** canais (WhatsApp, telefone, e-mail, endereço, horário, redes) · formulário que monta a mensagem e abre o WhatsApp.
- **Informação que deve aparecer:** todos os canais oficiais e o horário.
- **Ação esperada:** enviar a mensagem pelo WhatsApp.

### Páginas de apoio

| Página | Função | Ação esperada |
|---|---|---|
| `/termos` | Dizer o que este site é: um redesign acadêmico, não o site oficial; de quem são a marca e as mídias; o que são os links externos. | Entender os limites do site. |
| `/privacidade` | Dizer o que o site coleta (nada), o que faz o formulário e como falar com o escritório sobre dados pessoais (LGPD). | Saber a quem pedir informação sobre seus dados. |
| `/login` e `/recuperar` | Acesso da equipe ao sistema interno. Não faz parte do site público. | Entrar (só a equipe). |
| Erro 404 | Orientar quando o endereço não existe. | Voltar ao início ou falar com o escritório. |

## Navegação e acesso

| De | Para | Como |
|---|---|---|
| Qualquer página | Início, Áreas, Escritório, Contato | cabeçalho e rodapé |
| Qualquer página | WhatsApp | botão do cabeçalho |
| Início | WhatsApp, Escritório, Áreas, Contato, Mapa | botões do ato 1 do trilho, seta em círculo do ato 2, índice de áreas e botões das seções |
| Áreas | Contato | botão no fim da página |
| Escritório | Site oficial (blog, MFV Cast, eventos), MZA, Contato | links da página |

No celular, o menu do cabeçalho abre por um botão "Menu" e fecha com "Fechar" ou com a tecla Esc.
