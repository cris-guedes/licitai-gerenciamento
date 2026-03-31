# Comandos Úteis

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
yarn dev

# Build de produção
yarn build

# Verificação de tipos TypeScript
npx tsc --noEmit
```

## MCP Inspector

Ferramenta visual para inspecionar e testar as tools do servidor MCP em tempo real.

```bash
npx @modelcontextprotocol/inspector
```

O inspector abre uma interface web onde você pode:
- Ver todas as tools registradas
- Testar cada tool individualmente com parâmetros
- Inspecionar os schemas de entrada/saída
- Ver os resources e prompts disponíveis

## Testes HTTP

```bash
# Rodar todos os 110 testes de endpoints HTTP (requer Git Bash no Windows)
& "C:\Program Files\Git\bin\bash.exe" scripts/test-http-api.sh

# Ou com base URL customizada
bash scripts/test-http-api.sh http://localhost:3000
```
