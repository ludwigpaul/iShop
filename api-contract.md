# API Contract

## What is OpenAPI?

OpenAPI is a specification for describing REST APIs in a standardized format 
using either JSON or YAML.

- This was originally known as Swagger.
- This is now maintained by the OpenAPI Initiative, part of the Linux Foundation.
- It allows developers to define the structure of their APIs, including endpoints,
  request/response formats, authentication methods, and more.

Purpose: To define a standard, language-agnostic interface to REST APIs.

## What is Swagger?

Swagger refers to a suite of open-source tools that work with the OpenAPI specification.

| Tool | Description |
| ---- | ----------- |
| Swagger Editor | A web-based tool for editing OpenAPI specifications. |
| Swagger Codegen | A tool for generating client libraries from OpenAPI specifications. |
| Swagger UI | A web-based tool for viewing and interacting with OpenAPI specifications. |
| SwaggerHub | A cloud-based platform for managing OpenAPI specifications. |

## Structure of an OpenAPI Specification

```
openapi: 3.0.0
info:
  title: iShop API
  version: 1.0.0
  description: A simple iShop API for creating and retrieving users, 
  products and orders.
servers:
  - url: http://localhost:3000/api/v1
  - url: https://ishop-api.dev.com/api/v1
  - url: https://ishop-api.prod.com/api/v1
paths:
  /users:
    get:
      summary: Returns a list of users.
      responses:
        '200':
          description: A list of users.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

Key Sections:
- openapi: OpenAPI version
- info: Information about the API
- servers: List of servers that the API is hosted on
- paths: List of paths and their operations (HTTP methods)
- components: Reusable components

- You can create OpenAPI automatically or manually.

### Importance of OpenAPI

| Benefits | Explanation |
| -------- | ----------- |
| Documentation | Allows developers to easily understand the API. |
| Code Generation | Allows developers to generate client libraries for the API. |
| Testing | Allows developers to test the API. |
| Versioning | Allows developers to update the API without breaking existing clients. |
| Security | Allows developers to secure the API. |