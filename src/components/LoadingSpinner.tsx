interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function LoadingSpinner({ size = 'md', label }: Props) {
  const dims = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className={`${dims} border-2 border-ink-700 border-t-brand-500 rounded-full animate-spin`} />
      {label && <p className="text-sm text-ink-400">{label}</p>}
    </div>
  )
}
