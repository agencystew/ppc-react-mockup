// v2 PillButton primitive
//
// 999px radius. 4px hard offset shadow. Three variants:
//   primary — purple fill, white text
//   ink     — ink fill, white text (1.5px ink border)
//   ghost   — white fill, ink text, 1.5px ink border
//
// Renders as <button> by default. If `href` is set, renders as <a>. The
// prop typing is discriminated so TS catches `onClick` on an anchor etc.

import { clsx } from 'clsx';
import type { MouseEventHandler, ReactNode } from 'react';

type Variant = 'primary' | 'ink' | 'ghost';

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
};

type AnchorProps = CommonProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
};

type PillButtonProps = ButtonProps | AnchorProps;

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-sans text-[17px] font-bold leading-none whitespace-nowrap select-none transition-transform active:translate-y-[1px]';

function variantClass(variant: Variant): string {
  switch (variant) {
    case 'primary':
      // Purple #7F5AF0 (ppc-purple-500) + white text + 4px ink offset shadow.
      return 'bg-ppc-purple-500 text-white shadow-btn hover:-translate-y-[1px]';
    case 'ink':
      // Ink fill + white text + 4px pure black offset (matches v2 spec).
      return 'bg-ink text-white border-[1.5px] border-ink shadow-[0_4px_0_#000] hover:-translate-y-[1px]';
    case 'ghost':
      // White fill + ink text + 1.5px ink border + 4px ink offset shadow.
      return 'bg-white text-ink border-[1.5px] border-ink shadow-btn hover:-translate-y-[1px]';
  }
}

export function PillButton(props: PillButtonProps) {
  const variant = props.variant ?? 'primary';
  const className = clsx(baseClass, variantClass(variant), props.className);

  if (props.href !== undefined) {
    const { href, onClick, target, rel, children } = props;
    return (
      <a
        href={href}
        onClick={onClick}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        className={className}
      >
        {children}
      </a>
    );
  }

  const { onClick, type, children } = props;
  return (
    <button type={type ?? 'button'} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
