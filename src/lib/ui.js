// Centralized UI class constants - single source of truth for button styles.
// All buttons across the app should use these variants for consistency.

export const BTN = {
    // Primary CTA: high-contrast cyan, black text (WCAG AA)
    primary: 'bg-cyan-500 text-black font-bold hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
    // Secondary: subtle border, white text
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
    // Ghost: text-only, no background
    ghost: 'text-zinc-400 hover:text-white hover:bg-white/5 active:scale-[0.98] transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
    // Danger: destructive action
    danger: 'bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 hover:text-red-300 active:scale-[0.98] transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50',
    // Disabled state shared across variants
    disabled: 'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
};

// Shared interactive base: applies to all buttons
export const INTERACTIVE = 'cursor-pointer select-none';
