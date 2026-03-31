Para montar a interface de busca manual do seu sistema, precisamos traduzir a arquitetura da API do PNCP (Portal Nacional de Contratações Públicas) em filtros práticos que o usuário possa selecionar na tela. 

A arquitetura técnica da API do PNCP foi desenhada para permitir o rastreamento de compras através de metadados bem estruturados. Com base nas rotas e categorias disponibilizadas pela API, você pode agrupar os filtros manuais no seu formulário da seguinte forma:

### 1. Filtros de Localização e Órgão (Quem está comprando e onde)
Estes filtros ajudarão a sua empresa a buscar oportunidades apenas nas regiões onde atende ou em órgãos específicos.
*   **Estado (UF) e Município:** Permite filtrar licitações por localização geográfica. O sistema pode preencher esses dados buscando os entes federativos.
*   **Nome ou CNPJ do Órgão:** Caso o usuário queira buscar licitações de um cliente público específico (ex: "Polícia Militar do Paraná"). A API possui a rota nativa `GET /v1/orgaos/` (Consultar Órgão por Filtro) e `GET /v1/orgaos/{cnpj}` que facilitam essa busca exata.

### 2. Filtros do Objeto e Categoria (O que está sendo comprado)
Estes são os filtros centrais para cruzar com a capacidade técnica (CNAE e Atestados) da sua empresa.
*   **Categoria do Item:** A API classifica as contratações por categorias de itens (ex: bens, serviços, obras). A API fornece essas categorias através da rota `GET /v1/categoriaItemPcas`. O usuário selecionaria isso via menu suspenso (dropdown).
*   **Palavras-chave do Objeto:** Uma barra de busca livre para o usuário digitar o que vende (ex: "Construção", "Medicamentos"). O sistema fará a busca pela descrição da licitação, já que os metadados iniciais enviados pelos órgãos definem o objeto da compra.

### 3. Filtros de Modalidade e Regras (Como será a disputa)
A Lei 14.133/2021 exige dados rígidos que a API do PNCP mapeia perfeitamente. O usuário poderá selecionar as regras que mais lhe favorecem:
*   **Modalidade de Contratação:** O usuário pode escolher como quer competir. As opções incluem "Pregão" (para bens comuns), "Concorrência", ou até mesmo "Diálogo Competitivo". A lista de modalidades permitidas é puxada da rota `GET /v1/modalidades`.
*   **Critério de Julgamento:** Fundamental para a estratégia da sua empresa. A API possui a rota `GET /v1/criterios-julgamentos` e permite filtrar por:
    *   *Menor Preço:* Vence a proposta mais barata.
    *   *Maior Desconto:* Vence quem der o maior percentual de desconto sobre tabelas oficiais.
    *   *Melhor Técnica* ou *Técnica e Preço:* Vence quem tiver a melhor qualidade (ideal se sua empresa for altamente especializada).
*   **Modo de Disputa:** O usuário pode filtrar se prefere disputas no modo "Aberto" (onde os lances são públicos e sucessivos), "Fechado" (propostas sigilosas até a abertura), ou combinados. A API traz isso pela rota `GET /v1/modos-disputas`.

### 4. Filtros Financeiros e de Tempo (Quando e por quanto)
*   **Valor Estimado (Mínimo e Máximo):** O valor total estimado é um metadado inicial obrigatório de cada contratação na API. Na sua tela, você deve colocar um filtro de valor (ex: "De R$ 100.000 a R$ 500.000"). *Isso dialoga perfeitamente com aquele filtro automático de corte que discutimos, garantindo que o valor exigido de Patrimônio Líquido não ultrapasse a capacidade da sua empresa.*
*   **Ano e Período:** Para buscar apenas editais recentes e ativos. A estrutura das rotas do PNCP usa o parâmetro `{ano}` (ex: `/v1/orgaos/{cnpj}/compras/{ano}/...`), o que facilita muito filtrar contratações do ano corrente.

**Como esses filtros funcionam por trás dos panos?**
Quando o usuário preencher essas seleções na sua interface, o seu servidor (ou seu agente MCP) vai concatenar essas escolhas e fazer requisições direcionadas na API (usando métodos `GET`). Em vez de baixar o banco de dados inteiro do Brasil, o sistema trará apenas os arquivos JSON limpos e filtrados correspondentes aos parâmetros escolhidos.

Gostaria de ver como seria a estrutura JSON (o "esqueleto" dos dados) de uma requisição de busca utilizando alguns desses filtros combinados, para já ajudar na visualização técnica do projeto?


1. Filtros em Comum (Usados tanto pela Busca Estática quanto pela IA)
Estes são os "filtros de corte". Eles são fundamentais para reduzir o volume de dados trazidos do governo antes de apresentar na tela ou antes de enviar para a IA ler. Ambos os métodos usarão estes parâmetros nativos nas rotas da API:
Ano da Compra ({ano}): Essencial para buscar apenas editais vigentes no ano corrente (ex: rota /v1/orgaos/{cnpj}/compras/{ano}).
Órgão Comprador (CNPJ ou ID): Filtrar licitações de um cliente público específico (ex: Governo do Paraná) usando as rotas /v1/orgaos/{cnpj} ou /v1/orgaos/id/{orgaoId}.
Modalidade de Contratação: Filtrar por Pregão, Concorrência, Diálogo Competitivo, etc., utilizando os IDs da rota /v1/modalidades.
Critério de Julgamento: Parâmetro decisivo para a estratégia (ex: Menor Preço, Maior Desconto, Melhor Técnica) puxados da rota /v1/criterios-julgamentos.
Valor Estimado (Mínimo/Máximo): O valor total da compra é um metadado obrigatório na inicialização do processo. Serve para descartar licitações que exigem capital social maior que o da sua empresa.
2. Filtros Estáticos (Exclusivos da Rota Manual/API Direta)
Estes filtros são seleções em menus suspensos (dropdowns) ou caixas de seleção, perfeitos para usuários que sabem exatamente as regras burocráticas que estão buscando. Eles funcionam mapeando diretamente os endpoints (rotas) estruturados do Swagger do PNCP:
Busca Exata por Sequencial: Quando o usuário já tem o número exato do edital e quer ir direto ao ponto (/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}).
Amparo Legal (Base na Lei): Permitir que o usuário filtre processos baseados em leis específicas (ex: Lei 14.133/2021) através da rota /v1/amparos-legais.
Categoria do Item do Plano de Contratação: Filtro por IDs exatos de categorias de bens, serviços ou obras, consultando /v1/categoriaItemPcas.
Modo de Disputa: Selecionar entre modo "Aberto" ou "Fechado" utilizando os dados da rota /v1/modos-disputas.
3. Filtros Inteligentes (Exclusivos da Rota IA + MCP)
Aqui é onde o sistema brilha. Como a IA acessa a API via Model Context Protocol (MCP), ela não depende apenas de menus suspensos e códigos. Ela usa Processamento de Linguagem Natural (NLP) e orquestração de múltiplos passos para cruzar dados estruturados com documentos complexos (PDFs).
Busca Semântica Complexa: O usuário digita em texto livre. Ex: "Encontre licitações ativas para construção de estradas no Paraná com valor superior a 5 milhões". A IA traduz isso e navega pela API dinamicamente.
Match de Capacidade Técnica (Atestados): A IA entra nos metadados dos itens (rota /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens) e faz o cruzamento do descritivo técnico exigido pelo governo com o texto das experiências anteriores que você cadastrou no perfil da sua empresa.
Identificação de Restrições Ocultas e Certificações: A IA pode acessar a rota de download de arquivos (/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/{sequencialDocumento}), "ler" o PDF do edital inteiro e filtrar oportunidades removendo aquelas que exigem certificações que sua empresa não tem (ex: ISO 9001, atestados específicos do CREA).
Filtro de Viabilidade Financeira (Análise de Risco): Após encontrar um edital que bate com sua área, a IA lê as cláusulas para o usuário e alerta sobre riscos: multas abusivas ou prazos de entrega muito curtos, coisas que uma API estática jamais conseguiria filtrar sozinha.
Na interface, você pode colocar os Filtros em Comum e os Estáticos no painel lateral esquerdo, e uma grande barra de "Assistente IA" no topo para acionar os Filtros Inteligentes.