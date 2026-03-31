1. regras todos os campos devem ter um icone de info falando o motivo do input existir 

2. o step de cadastro da empresa e obrigatorio os steps de cadastro de informacoes da IA podem pular se ser cadastrado em um outro momento 

Para a Parte 1 (Cadastro Essencial), focada exclusivamente em alimentar o Serviço Estático (sua integração manual direta com a API REST do PNCP), você precisa apenas dos dados que interagem diretamente com os parâmetros nativos das rotas do governo.
Como conversamos, todos estes campos podem ser 100% preenchidos automaticamente com uma única chamada à API de consulta de CNPJ, bastando ao usuário apenas confirmar se estão corretos na tela:
1. CNPJ da Empresa
Por que é obrigatório: É a chave primária de identificação do usuário no seu banco de dados e o gatilho para preencher o resto do formulário.
2. CNAE Principal e Secundários (Ramo de Atividade)
Por que é obrigatório para a API PNCP: A API do governo possui a rota nativa GET /v1/categoriaItemPcas (Consultar categorias de item). Ao salvar o CNAE no cadastro, o seu sistema já consegue mapear automaticamente quais as categorias de bens ou serviços o usuário vende, pré-selecionando essas opções nos menus de busca manual.
3. Porte da Empresa (ME, EPP ou Outros)
Por que é obrigatório para a API PNCP: Editais presentes no PNCP seguem a Lei Complementar Federal nº 123/2006, que garante benefícios e exclusividade de lotes (geralmente até R$ 80.000,00) para Microempresas (ME) e Empresas de Pequeno Porte (EPP). O seu sistema precisa dessa informação para que, na tela de busca manual, você possa habilitar um botão de filtro rápido do tipo: "Mostrar apenas licitações exclusivas para o meu porte".
4. Localização (UF e Município da Sede)
Por que é obrigatório para a API PNCP: A API do PNCP permite consultar entes compradores através da rota GET /v1/orgaos/ (Consultar Órgão por Filtro). Com o Estado e a Cidade salvos no cadastro básico, a sua interface de busca manual já pode vir pré-configurada para mostrar primeiro as licitações dos órgãos públicos da mesma região do usuário.
Resumo da Experiência do Usuário nesta 1ª Etapa: O usuário digita o CNPJ -> O seu sistema faz o GET na BrasilAPI -> A tela exibe o Nome, CNAE, Porte (ME/EPP) e UF bloqueados para edição -> O usuário clica em "Confirmar Cadastro Básico" e já está liberado para usar a busca manual estática do PNCP.



Perfeito! Avançar para um formulário multi-step (em várias etapas) é a melhor prática de usabilidade. A Fase 1 capturou o que chamamos de "Dados Frios" (identificação básica). Agora, nas fases seguintes, vamos construir o "Cérebro do Gêmeo Digital".
Estas etapas contêm informações que a Inteligência Artificial utilizará ativamente como contexto no MCP para ler PDFs complexos, fazer análises de risco, realizar cruzamentos semânticos e, principalmente, garantir que você não perca tempo lendo editais nos quais sua empresa seria desclassificada por regras da Lei nº 14.133/2021.
Aqui está a separação lógica das próximas etapas do seu formulário, estruturadas com a explicação para o usuário e o porquê de cada input existir:

--------------------------------------------------------------------------------
Passo 2: Qualificação Econômico-Financeira
Área de Enriquecimento: Saúde financeira da empresa. Por que enriquecer: A lei de licitações exige garantias financeiras rígidas para evitar que empresas quebrem no meio do contrato. A IA usará esses dados como uma "régua de corte" matemática para filtrar editais cujo escopo financeiro seja maior do que a sua empresa suporta legalmente.
Input 1: Patrimônio Líquido Atualizado (R$)
Ícone de Informação (Por que existe): "A Lei nº 14.133/2021 permite que os editais exijam um Patrimônio Líquido mínimo de até 10% do valor estimado da contratação. A IA usará este valor para descartar automaticamente licitações gigantescas que ultrapassem a capacidade de qualificação da sua empresa."
Input 2: Índices de Liquidez e Solvência (LG, SG e LC)
Ícone de Informação (Por que existe): "Editais exigem que os índices de Liquidez Geral (LG), Solvência Geral (SG) e Liquidez Corrente (LC) sejam maiores ou iguais a 1,0 (ou 0,5 em alguns casos). Se a IA identificar que o edital exige um índice de 1.5 e o seu for 1.2, ela alertará que sua empresa seria inabilitada."
Input 3: A empresa está em Recuperação Judicial? (Sim/Não)
Ícone de Informação (Por que existe): "Empresas em recuperação judicial podem participar, mas precisam apresentar plano de recuperação acolhido ou demonstrações contábeis específicas. A IA filtrará as exigências adicionais do edital caso esta opção esteja marcada."

--------------------------------------------------------------------------------
Passo 3: Capacidade Técnica e Operacional
Área de Enriquecimento: O que a sua empresa sabe fazer e tem como provar. Por que enriquecer: Não basta saber fazer o serviço, é preciso provar por meio de atestados anteriores. A IA cruzará o texto das suas experiências com as exigências técnicas (Termos de Referência) dos editais para calcular o seu percentual de Match (compatibilidade).
Input 1: Palavras-chave dos Atestados de Capacidade Técnica (Caixa de tags livres)
Ícone de Informação (Por que existe): "A lei exige comprovação de execução de serviços com características, quantidades e prazos compatíveis com o lote disputado. A IA fará uma análise semântica cruzando essas palavras-chave com as exigências do edital para garantir que seus atestados serão aceitos."
Input 2: Possui profissionais registrados em Conselhos de Classe? (CREA, CAU, etc.) (Sim/Não + Quais?)
Ícone de Informação (Por que existe): "Muitos editais de obras e serviços técnicos exigem que a empresa possua um responsável técnico registrado no conselho competente (ex: CREA ou CAU) no momento da entrega dos documentos. A IA filtrará oportunidades que exijam conselhos nos quais você não possui registro."
Input 3: Interesse em participar via Consórcio? (Sim/Não)
Ícone de Informação (Por que existe): "Consórcios permitem somar atestados técnicos e valores de qualificação financeira (com acréscimo de 30% na exigência) com outras empresas. A IA buscará editais maiores que permitam consórcio caso os seus índices individuais não sejam suficientes sozinhos."

--------------------------------------------------------------------------------
Passo 4: Critérios de Desempate e Sustentabilidade (Bônus Competitivos)
Área de Enriquecimento: Atributos sociais, ambientais e de governança (ESG). Por que enriquecer: A Nova Lei de Licitações possui regras severas de desempate e exigências de conformidade. Ter esses atributos significa que a IA saberá que sua empresa tem uma "carta na manga" para vencer concorrentes com propostas de valor idêntico ou para entrar em licitações exclusivas.
Input 1: Possui Programa de Integridade (Compliance)? (Sim/Não)
Ícone de Informação (Por que existe): "O desenvolvimento de programa de integridade é um critério oficial de desempate. Além disso, em contratações de grande vulto, a lei exige a implantação desse programa. A IA destacará licitações onde isso te dá vantagem."
Input 2: Possui Selo 'Empresa Amiga da Mulher' ou Equidade de Gênero? (Sim/Não)
Ícone de Informação (Por que existe): "O desenvolvimento de ações de equidade de gênero e o selo 'Empresa Amiga da Mulher' são critérios legais de desempate. A IA pontuará positivamente editais com alto risco de empate onde você venceria por este critério."
Input 3: Cumpre cotas para Pessoas com Deficiência (PcD) e Reabilitados? (Sim/Não)
Ícone de Informação (Por que existe): "É uma exigência obrigatória para habilitação declarar o cumprimento da reserva de cargos para PcD estipulada em lei (Art. 63, IV). A IA garantirá que sua empresa cumpre o requisito social básico exigido no edital."
Input 4: Possui práticas de mitigação climática / logística reversa? (Sim/Não)
Ícone de Informação (Por que existe): "Práticas de mitigação climática são critérios de desempate, e a responsabilidade por logística reversa é exigida em políticas públicas de sustentabilidade. A IA buscará editais com selo verde (Green Procurement)."
