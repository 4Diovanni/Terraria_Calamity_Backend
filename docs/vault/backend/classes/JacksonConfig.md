---
tags: [backend, config]
aliases: [JacksonConfig]
up: "[[Submission]]"
related:
  - "[[WeaponPayloadMapper]]"
status: ativo
source: src/main/java/com/terraria/calamity/config/JacksonConfig.java
---

# JacksonConfig

Fornece um bean `ObjectMapper` (Jackson clássico `com.fasterxml.jackson`) para
conversões Map↔DTO internas — usado por [[WeaponPayloadMapper]].

## Métodos (beans)

### `objectMapper() -> ObjectMapper`
Bean explícito. **Por que existe:** o Spring Boot 4.1 nesta stack não registra
automaticamente um `ObjectMapper` desse namespace (a autoconfiguração HTTP usa
Jackson 3 `tools.jackson`), então sem este bean o [[WeaponPayloadMapper]] não teria o
que injetar. Não interfere na serialização HTTP do MVC.

## Conexões

- Consumido só por [[WeaponPayloadMapper]] (injeção do `ObjectMapper`).
