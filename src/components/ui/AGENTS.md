# UI components guide

## Base rules
- Use named exports only. Never use default exports.
- Extend native element props in TypeScript (e.g. ButtonHTMLAttributes).
- Use React.forwardRef for interactive elements.
- Prefer CSS variables for colors and fonts.
- Prefer composition with subcomponents over prop-heavy APIs.

## Variants
- Use tailwind-variants (tv) to define variants and sizes.
- Pass className directly to tv: buttonVariants({ variant, size, className }).
- Do not use twMerge or cn when using tv for variants.

## Structure
- Place generic UI components in src/components/ui.
- Keep files small and focused on one component.
- Export the variant type: Parameters<typeof variants>[0].
- Use Root/Label/Title subcomponents for composable blocks.
