---
tags: [frontend, ui, design-system]
aliases: [Carrossel, Carousel]
up: "[[Frontend-MOC]]"
related:
  - "[[WeaponsPage]]"
  - "[[Calamity visual identity|project_visual_identity]]"
status: ativo
source:
  - src/frontend/src/components/ui/Carousel.tsx
---

# Carousel — Componente de Carrossel

Componente de UI reutilizável (`components/ui/Carousel.tsx`) usado nas páginas de
lore/conteúdo (biomas, bosses, inimigos) para exibir cards em cartão retrato.

## Arquivo

- `Carousel.tsx` — exporta `CarouselItem` (contrato de dado) e `PortraitCard`
  (card individual com imagem/gradiente de fundo, `accentColor` opcional)

## Regra de design (não óbvia)

A prop `layout` (`portrait-left` | `portrait-right`) é **fixa por seção**, nunca
alternada por índice de slide — ver [[feedback_carousel_layout]] na memória do
projeto. Usa apenas tokens `calamity-*` do Tailwind, sem hex hardcoded (exceto cores
semânticas de gameplay).

## Conexões

- Segue os tokens definidos na identidade visual do projeto.
- Usado como building block nas páginas de listagem — mesmo padrão visual de
  [[WeaponsPage]] para cards.
