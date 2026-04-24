import { createDocument, createSchema, oas31 } from "zod-openapi";
import { apiEndpoints } from "./schemas";

function buildQueryParameters(schema: oas31.SchemaObject): oas31.ParameterObject[] {
  return Object.entries(schema.properties || {}).map(([name, fieldSchema]) => ({
    name,
    in: "query" as const,
    required: (schema.required || []).includes(name),
    schema: fieldSchema as oas31.SchemaObject,
  }));
}

/**
 * Generates the OpenAPI specification for the Core API.
 * To add a new endpoint, register it in schemas.ts — this file never changes.
 */
export function generateOpenApiSpec() {
  const componentSchemas: Record<string, oas31.SchemaObject> = {};

  const paths = Object.fromEntries(
    apiEndpoints.map(({ path, operationId, tag, summary, description, successDescription, method, schemas, extraSchemas, requestBodyOverride, responsesOverride }) => {
      const isPost = method === 'POST';
      const querySchema = schemas.Query ? (createSchema(schemas.Query).schema as oas31.SchemaObject) : { properties: {} } as oas31.SchemaObject;
      const responseSchemaName = `${operationId.charAt(0).toUpperCase() + operationId.slice(1)}Response`;

      componentSchemas[responseSchemaName] = createSchema(schemas.Response).schema as oas31.SchemaObject;

      if (extraSchemas) {
        for (const [name, schema] of Object.entries(extraSchemas)) {
          componentSchemas[name] = createSchema(schema).schema as oas31.SchemaObject;
        }
      }

      const defaultResponses: oas31.ResponsesObject = {
        "200": {
          description: successDescription,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${responseSchemaName}` } as oas31.ReferenceObject,
            },
          },
        },
      };

      const methodObject: oas31.OperationObject = {
        summary,
        description,
        operationId,
        tags: [tag],
        parameters: buildQueryParameters(querySchema),
        responses: (responsesOverride as oas31.ResponsesObject | undefined) ?? defaultResponses,
      };

      if (isPost && requestBodyOverride) {
        methodObject.requestBody = requestBodyOverride as oas31.RequestBodyObject;
      } else if (isPost && schemas.Body) {
        methodObject.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: createSchema(schemas.Body).schema as oas31.SchemaObject,
            },
          },
        } as oas31.RequestBodyObject;
      }

      return [
        path,
        isPost ? { post: methodObject } : { get: methodObject },
      ];
    })
  ) as oas31.PathsObject;

  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "Licitare Core API",
      description: "API para gestão e busca de licitações públicas (PNCP) e detalhes de empresas.",
      version: "1.0.0",
    },
    servers: [{ url: "/api/core", description: "Core API Base URL" }],
    components: {
      schemas: componentSchemas,
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
    paths,
  });
}
