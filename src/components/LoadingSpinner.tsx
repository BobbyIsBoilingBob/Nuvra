interface Props { size?: 'sm' | 'md' | 'lg'; label?: string }

export default function LoadingSpinner({ size = 'md', label }: Props) {
  const dims = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  const bw = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' }[size]
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in">
      <div className={`${dims} ${bw} border-surface-400/30 border-t-brand-400 rounded-full animate-spin`} />
      {label && <p className="text-sm text-ink-400 font-medium">{label}</p>}
    </div>
  )
}
