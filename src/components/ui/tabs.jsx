import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

// Abas do Pátio: linha de base com a aba ativa marcada pela faixa azul (sem "pílula" cinza)
function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col', className)} {...props} />
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('flex w-full gap-6 overflow-x-auto border-b', className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        '-mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent pt-1 pb-3 font-medium whitespace-nowrap text-texto-suave transition-colors',
        'hover:text-texto data-[state=active]:border-marca data-[state=active]:text-texto',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
