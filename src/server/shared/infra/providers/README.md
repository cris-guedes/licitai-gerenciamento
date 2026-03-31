# Padrão de Implementação de Providers

Este diretório contém as implementações concretas dos providers. Seguimos o padrão de **High-Density Typing** para garantir que todas as entradas e saídas sejam fortemente tipadas e extensíveis.

## 🚀 Princípios Core

1. **Namespaces de Implementação**: Cada classe de provider deve ter um `namespace` associado (ex: `BCryptHashProvider`).
2. **Objetos de Parâmetro (Params)**: Todos os métodos devem receber um único objeto de parâmetros, desestruturado na assinatura.
3. **Tipos de Resposta (Response)**: Todos os métodos devem ter um tipo de retorno explícito definido no namespace.
4. **Independência de Libs**: Embora a implementação use bibliotecas externas (bcrypt, jsonwebtoken, date-fns), a tipagem deve ser limpa e voltada para o domínio.

---

## 📂 Estrutura de Implementação (Exemplo)

```typescript
export class BCryptHashProvider implements HashProvider {
    async hashPassword({ password }: BCryptHashProvider.HashPasswordParams): Promise<BCryptHashProvider.HashPasswordResponse> {
        return bcrypt.hash(password, 8);
    }
}

export namespace BCryptHashProvider {
    export type HashPasswordParams = { password: string };
    export type HashPasswordResponse = string;
}
```

---

## ✅ Checklist de Implementação
- [ ] O método recebe um objeto `{ ... }`?
- [ ] O tipo do parâmetro termina em `Params`?
- [ ] O tipo do retorno termina em `Response`?
- [ ] O namespace tem o mesmo nome da classe?
- [ ] A interface no domínio está "ponteada" para este namespace?

---

## 🤖 Prompt para IA (The Perfect Provider Prompt)

> "Implemente o provider [Nome] seguindo o Padrão de Namespaces e Objetos de Parâmetro. 
> 1. Use um namespace interno para agrupar [Method]Params e [Method]Response. 
> 2. Todos os métodos devem receber objetos desestruturados na assinatura. 
> 3. Garante que a interface no domínio espelhe essas tipagens via ponte de namespace (Bridge)."
