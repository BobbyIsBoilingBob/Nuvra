interface Props { size?: 'sm' | 'md' | 'lg' }
export default function LoadingSpinner({ size = 'md' }: Props) {
  const dims = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' }
  return <div className={dims[size] + ' rounded-full border-surface-300 border-t-brand-500 animate-spin'} />
}
