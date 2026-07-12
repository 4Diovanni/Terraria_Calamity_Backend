---
tags: [frontend, service, armor]
aliases: [armorService, armorService.ts]
up: "[[ArmorPages]]"
related:
  - "[[apiClient-ts]]"
  - "[[ArmorController]]"
status: ativo
source: src/frontend/src/services/armorService.ts
---

# armorService.ts

Client HTTP de armaduras (`/api/v1/armor`), sobre [[apiClient-ts]]. Contraparte
frontend do [[ArmorController]] — só leitura (o frontend não cria/edita armadura hoje).

## Métodos

### `getAllArmors() -> Armor[]`
`GET /`. **Chamado por:** [[ArmorPages]] (`ArmorPage`). **Chama:** [[ArmorController]]`.getAllArmors`.

### `getArmorById(id) -> Armor`
`GET /{id}`. **Chamado por:** [[ArmorPages]] (`ArmorDetailPage`).

## Conexões

- Sobre [[apiClient-ts]]; consumido por [[ArmorPages]].
- Espelha o [[ArmorController]] do backend.
