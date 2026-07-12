---
tags: [backend, weapons, elements]
aliases: [Elementos, Element]
up: "[[Backend-MOC]]"
related:
  - "[[Weapons]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity/api/controller/WeaponElementController.java
  - src/main/java/com/terraria/calamity/application/service/WeaponElementService.java
  - src/main/java/com/terraria/calamity/domain/entity/Element.java
---

# Element — Elementos de Arma

API dedicada a explorar o enum `Element` (elementos de dano de arma: neutro, vanilla
Terraria, Calamity, especiais) — listagem, validação, cálculo de bônus de dano e
compatibilidade entre elementos.

## Arquivos

- `WeaponElementController.java` — `GET /api/v1/elements` (lista todos com
  displayName/descrição/cor/grupo), `GET /{elementName}`, `GET /group/{group}`
  (`vanilla`/`calamity`/`supreme`), `POST /validate`, `POST /bonus` (calcula dano
  final com bônus do elemento), `POST /compatibility`
- `WeaponElementService.java` — regra de negócio: parse de string para `Element`,
  bônus por grupo (`isSupreme` → 2.5x), compatibilidade entre elementos
- `Element.java` — enum com nome legível, descrição, cor e flags de grupo
  (`isVanilla`/`isCalamity`/`isSupreme`)

## Notas

Endpoint todo público, sem uso de persistência (opera só sobre o enum em memória).
**O frontend não consome esta API**: `WeaponsPage.tsx`/`WeaponForm.tsx` mantêm sua
própria constante local `ELEMENT` com a lista de elementos, duplicando o que já
existe aqui — se a lista de elementos do backend mudar, o frontend não reflete
automaticamente.

## Classes (notas de método)

- [[WeaponElementController]] — rotas de listagem/validação/bônus/compatibilidade
- [[WeaponElementService]] — lógica de domínio sobre o enum `Element`

## Conexões

- O campo `element` de [[Weapons]] usa este enum.
