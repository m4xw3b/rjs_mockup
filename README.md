# 📻 Rádio Jornal de Setúbal - 88.6 FM (Web Portal)

Este repositório contém o código-fonte do novo portal web da **Rádio Jornal de Setúbal (88.6 FM)**. O projeto foi totalmente redesenhado para oferecer uma experiência moderna, rápida e focada no utilizador, operando como uma *Single Page Application* (SPA) com um *Dark Theme* nativo.

## 🔄 Evolução Visual

### Versão Anterior
*Abaixo encontra-se o registo visual da interface anterior do portal:*

> **Nota:** Substituir este texto e a imagem abaixo pelo link da fotografia da versão antiga.
![Versão Anterior da Rádio](https://raw.githubusercontent.com/m4xw3b/rjs_mockup/main/rjs_original.jpg)

### Nova Versão (Atual)
*O novo design otimizado, com foco em leitura noturna, dinamismo visual e integração fluida de conteúdos em tempo real:*

> **Nota:** Substituir este texto e a imagem abaixo pelo link da fotografia da nova versão.
![Nova Versão da Rádio Jornal](https://raw.githubusercontent.com/m4xw3b/rjs_mockup/main/rjs_mockup1.jpg)
---

## 🚀 Arquitetura e Blocos Funcionais

O portal foi construído utilizando **HTML5, CSS3 puro (Flexbox/Grid)** e **Vanilla JavaScript**, sem dependências de frameworks pesadas, garantindo um carregamento ultrarrápido. Abaixo detalhamos os principais módulos da aplicação:

### 1. 🎵 Top Player Fixo com Visualizador de Áudio
Uma barra superior que acompanha a navegação do utilizador (*sticky header*). Integra um reprodutor de áudio HTML5 diretamente ligado à stream ao vivo da rádio.
* **Ondas Sonoras Animadas:** Através de CSS puro, ativamos uma animação de equalizador sincronizada com o botão de "Play", dando resposta visual imediata de que a rádio está em emissão.
* **Controlo de Volume:** Integrado nativamente sem necessidade de popups adicionais.

### 2. ⚡ Ticker Contínuo de Tecnologia
Uma faixa dinâmica em *scroll* infinito dedicada à tecnologia.
* Alimentado pelo feed RSS do portal **Wintech**, carrega os últimos destaques tecnológicos de forma autónoma e contínua no topo da página.

### 3. 📰 Motor de Feeds RSS Externos (Notícias e Desporto)
Para manter o site sempre vivo sem necessidade de gestão manual de conteúdos, desenvolvemos um motor assíncrono em JavaScript (utilizando a API `rss2json`) que compila e limpa notícias de fontes oficiais:
* **Últimas Notícias:** Bloco de "Última Hora" ligado ao Notícias ao Minuto, formatado para apresentar a hora exata da publicação.
* **Desporto:** Alimentado pela RTP Desporto.
* **Notícias do Município:** Destaques locais extraídos diretamente do feed oficial da Câmara Municipal de Setúbal, alocados na barra lateral.

### 4. 🖼️ "Imagem do Dia" Dinâmica (Rotativa)
Um módulo visual que sorteia e apresenta aleatoriamente fotografias em alta resolução da região (Parque Natural da Arrábida, Portinho, etc.) sempre que a página é carregada.
* O sistema atribui automaticamente os créditos da imagem (ex: "por Pexels" ou "por iStock") e a respetiva legenda consoante a fotografia sorteada no momento.

### 5. 📱 Modal / Popup de Leitura Integrado
Para evitar que o ouvinte saia do portal (o que cortaria a emissão da rádio), todo o sistema de notícias funciona com *Modals*. 
* Ao clicar num destaque, abre-se um cartão escuro central em sobreposição com o resumo limpo da notícia e a hiperligação para o site oficial da fonte, mantendo o áudio intacto em *background*.

### 6. 📄 SPA e Gestão de Vistas
A navegação entre "Página Inicial", "Estatuto Editorial" e "Contactos" é feita sem recarregar a página. As secções são trocadas de forma instantânea através da manipulação de classes CSS (`.active`) via JavaScript.

### 7. 🎯 Espaços de Destaque e Publicidade
O layout incorpora áreas estratégicas para monetização e parcerias, incluindo:
* Um *Card* premium na barra lateral dedicado à **Wintech**, com apelo visual distinto.
* Um *Banner* inferior em formato standard horizontal (728x90) integrado de forma harmoniosa no *Dark Theme*.

---

## 🛠️ Como Executar o Projeto

Como o projeto é totalmente *Client-Side*, não requer bases de dados nem configurações de servidor complexas.

1. Clone o repositório para o seu ambiente local.
2. Abra o ficheiro `index.html` em qualquer browser moderno (Chrome, Edge, Firefox, Safari).
3. (Opcional) Para testes de integração de rede, utilize uma extensão como o *Live Server* do VS Code.

---
**Desenvolvido por João Fernandes** | Projeto dedicado à região de Setúbal.
