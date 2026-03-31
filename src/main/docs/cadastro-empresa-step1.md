Para estruturar a primeira fase do seu sistema, precisamos criar um formulário de "Perfil da Empresa" (o seu Gêmeo Digital). Esse perfil será o coração do contexto do **Model Context Protocol (MCP)**: é com base nestes dados que a IA saberá exatamente quais parâmetros usar nas rotas da API do Portal Nacional de Contratações Públicas (PNCP), filtrando apenas o que você tem capacidade legal e financeira para vencer.

Abaixo está a estrutura ideal para o seu formulário de *input*, dividido entre o que uma API de consulta de CNPJ (como a BrasilAPI ou Receita Federal, mencionadas anteriormente) preenche automaticamente e o que você precisará preencher manualmente.

### 1. Seção de Preenchimento Automático (Consulta via API do CNPJ)
Assim que o usuário digitar o CNPJ, o sistema fará uma requisição (GET) na API de CNPJ e preencherá estes campos. **Eles são a base da filtragem primária do MCP.**

*   **Razão Social e Nome Fantasia:** Identificação básica da empresa.
*   **CNAE Principal e CNAEs Secundários:** 
    *   *Como o MCP usa:* A IA usará os seus códigos de atividade (CNAE) para buscar na API do governo apenas os editais cujo objeto (descrição do serviço ou produto) seja compatível com a sua atividade legal.
*   **Porte da Empresa (ME, EPP ou Demais):** 
    *   *Como o MCP usa:* Editais com valor de até R$ 80.000,00 costumam ser exclusivos para Microempresas (ME) e Empresas de Pequeno Porte (EPP). Além disso, a IA saberá que sua empresa tem direito ao benefício de desempate caso sua proposta fique até 5% acima do primeiro colocado.
*   **Capital Social:**
    *   *Como o MCP usa:* É um indicador inicial do tamanho da empresa, embora para licitações o Patrimônio Líquido seja o mais exigido.
*   **Endereço (CEP, Município e UF):**
    *   *Como o MCP usa:* A IA pode dar preferência (e até usar como critério de desempate) para licitações que ocorram no seu próprio Estado ou Município, o que é previsto em lei.

---

### 2. Seção de Preenchimento Manual Obrigatório (Filtros Financeiros e Operacionais)
A API do CNPJ não tem acesso à sua contabilidade interna nem à sua estratégia de negócios. Você precisará preencher estes campos para criar os "filtros de corte" da IA.

*   **Patrimônio Líquido Atualizado (R$):**
    *   *Como o MCP usa:* A lei de licitações frequentemente exige que a empresa comprove um Patrimônio Líquido de, no mínimo, **10% do valor estimado da contratação**. O MCP usará este valor para descartar sumariamente editais gigantescos que a sua empresa não teria qualificação financeira para assumir.
*   **Índices Contábeis (LG, SG e LC):**
    *   *Campos:* Índice de Liquidez Geral (LG), Solvência Geral (SG) e Liquidez Corrente (LC).
    *   *Como o MCP usa:* Os editais exigem que esses índices sejam maiores ou iguais a 1,0 (ou 0,5 em alguns casos específicos). Se os seus índices forem menores que o exigido pelo edital, a IA filtrará essa oportunidade para evitar perda de tempo.
*   **Atestados de Capacidade Técnica (Palavras-chave ou Resumo):**
    *   *Campo:* Uma caixa de texto onde você descreve os serviços que já executou e possui atestado (ex: "Construção de rede de água", "Desenvolvimento de software em nuvem").
    *   *Como o MCP usa:* A IA fará uma análise semântica cruzando essas palavras com o Termo de Referência do edital para garantir que você tem a experiência prévia exigida para aquele lote.
*   **Filtro Estratégico de Valor e Região:**
    *   *Campos:* Valor Mínimo e Valor Máximo de interesse por contrato; Estados (UFs) onde a empresa tem operação logística.

---

### 3. Seção de Preenchimento Manual Opcional (Critérios de Desempate e Bônus)
A nova Lei de Licitações (14.133/2021) introduziu critérios rigorosos de desempate e qualificação. Se a sua empresa possuir estes atributos, a IA saberá que você tem uma vantagem competitiva.

*   **Possui Programa de Integridade (Compliance)? (Sim/Não):**
    *   *Como o MCP usa:* Ter um programa de integridade é critério de desempate e pode ser exigido como condição obrigatória em contratações de grande vulto.
*   **Possui Selo "Empresa Amiga da Mulher" ou políticas de equidade de gênero? (Sim/Não):**
    *   *Como o MCP usa:* O desenvolvimento de ações de equidade de gênero é o terceiro critério de desempate oficial na lei.
*   **Contrata pessoas com deficiência (PcD) ou egressos do sistema prisional? (Sim/Não):**
    *   *Como o MCP usa:* A declaração de reserva de cargos é obrigatória em vários editais e exigida na fase de qualificação.

### Como isso vira Contexto para o MCP?
Quando a sua IA for buscar oportunidades, o sistema pegará esse formulário e criará um prompt base (system prompt) invisível para o Agente. Será algo como:

> *"Você é um assistente de busca do PNCP atuando via MCP. O fornecedor é uma EPP (Microempresa), do Paraná, com CNAE de Engenharia, Patrimônio Líquido de R$ 500.000,00 e LG de 1.2. Busque apenas editais no PR e SC, cujo valor máximo seja de até R$ 5.000.000,00 (respeitando a regra de 10% do PL), e que exijam atestados compatíveis com 'construção civil'."*

Gostaria de estruturar o código Python inicial para criar essa interface e fazer a chamada na API pública de CNPJ, ou prefere desenhar como esses dados serão salvos no seu banco de dados (ex: estrutura JSON)?