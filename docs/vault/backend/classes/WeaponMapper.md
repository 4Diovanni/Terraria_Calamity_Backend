---
tags: [backend, mapper, weapons]
aliases: [WeaponMapper]
up: "[[Weapons]]"
related:
  - "[[WeaponService]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/mapper/WeaponMapper.java
---

# WeaponMapper

Conversão Entity↔DTO de arma. `@Component` manual (não é MapStruct, apesar da menção
genérica na nota-índice). Faz conversão segura String→Enum com fallback.

## Métodos

### `toEntity(CreateWeaponDTO) -> Weapon`
Versão a partir do DTO com enums. **Nota não óbvia:** não é chamada em lugar nenhum,
mas remover quebra o boot (comentário no código: "não sei porque se eu tirar isso o
app n roda"). Suspeito de dependência de assinatura/reflection — investigar antes de
remover.

### `toEntity(WeaponRequestDTO) -> Weapon`
Versão a partir do DTO com strings; converte `weaponClass`→enum (fallback MELEE) e
`element` via `Element.fromString` (fallback NEUTRAL). **Chamado por:** [[WeaponService]]
(create/update).

### `toResponseDTO(Weapon) -> WeaponResponseDTO`
Entity → DTO de resposta. **Chamado por:** [[WeaponService]] (todas as leituras).

## Conexões

- Usado exclusivamente por [[WeaponService]].
