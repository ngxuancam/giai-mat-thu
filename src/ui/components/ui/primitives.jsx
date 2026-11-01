/**
 * Primitive UI components, shadcn/ui style.
 *
 * Each is a thin wrapper over a native element: variants come from `cva`,
 * class conflicts are resolved by `cn`, and every colour is a theme token so
 * DESIGN.md stays the single source of truth.
 */

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ── Card ── */

/** `as` cho phép đổi thẻ gốc khi cần ngữ nghĩa khác, ví dụ `article`. */
export const Card = ({ as: Tag = 'div', className, ...props }) => (
  <Tag
    className={cn('rounded-(--radius) border border-border bg-card text-card-foreground shadow-[0_1px_0_var(--line)]', className)}
    {...props}
  />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-4 md:p-5', className)} {...props} />
);

/* ── Button ── */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_2px_0_color-mix(in_srgb,var(--stamp)_60%,black)] hover:bg-primary/90 active:translate-y-px active:shadow-none',
        outline: 'border border-border bg-card text-foreground hover:bg-secondary',
        ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      },
      size: {
        // 44px keeps taps comfortable on phones.
        default: 'h-11 px-5',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export const Button = ({ className, variant, size, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);

/* ── Form ── */

const fieldBase =
  'w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-[15px] ' +
  'placeholder:text-muted-foreground/55 focus-visible:outline-none focus-visible:border-ring ' +
  'focus-visible:ring-[3px] focus-visible:ring-ring/15';

export const Input = ({ className, ...props }) => (
  <input className={cn(fieldBase, className)} {...props} />
);

export const Textarea = ({ className, ...props }) => (
  <textarea className={cn(fieldBase, 'font-mono leading-relaxed resize-y', className)} {...props} />
);

export const Label = ({ className, hint, children, ...props }) => (
  <label className={cn('mb-1.5 block font-display text-sm font-bold tracking-wide', className)} {...props}>
    {children}
    {hint && <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">{hint}</span>}
  </label>
);

export const Checkbox = ({ className, ...props }) => (
  <input
    type="checkbox"
    className={cn('size-4 accent-primary cursor-pointer', className)}
    {...props}
  />
);

/* ── Display ── */

export const Badge = ({ className, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs',
      className
    )}
    {...props}
  />
);

export const Progress = ({ value = 0, className }) => (
  <div className={cn('h-1 w-full overflow-hidden rounded-full bg-border', className)}>
    <div
      className="h-full rounded-full bg-success"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

export const Separator = ({ className }) => (
  <div className={cn('h-px w-full bg-border', className)} />
);
