import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-controle border border-input bg-superficie px-3 text-base text-texto',
        'placeholder:text-texto-suave transition-[border-color] duration-150 outline-none',
        'focus-visible:border-marca focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-marca/40',
        'aria-invalid:border-vendido disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  )
}
