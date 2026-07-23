import { memo } from 'react'

function SkeletonCardInner() {
  return <div className="card-premium p-4"><div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl skeleton-base" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 skeleton-base rounded" /><div className="h-3 w-1/2 skeleton-base rounded" /></div></div></div>
}

function SkeletonListInner({ count = 4 }: { count?: number }) {
  return <div className="space-y-3">{Array.from({ length: count }).map((_, i) => <SkeletonCardInner key={i} />)}</div>
}

function SkeletonGridInner({ count = 6 }: { count?: number }) {
  return <div className="grid grid-cols-2 gap-3">{Array.from({ length: count }).map((_, i) => <div key={i} className="card-premium p-4"><div className="w-11 h-11 rounded-xl skeleton-base mb-3" /><div className="h-4 w-3/4 skeleton-base rounded mb-2" /><div className="h-3 w-1/2 skeleton-base rounded" /></div>)}</div>
}

function SkeletonStatsInner() {
  return <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card"><div className="w-10 h-10 rounded-lg skeleton-base" /><div className="flex-1 space-y-2"><div className="h-3 w-2/3 skeleton-base rounded" /><div className="h-4 w-1/2 skeleton-base rounded" /></div></div>)}</div>
}

function SkeletonProfileInner() {
  return <div className="space-y-5"><div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-5 text-center"><div className="inline-block w-24 h-24 rounded-full skeleton-base mb-3" /><div className="h-5 w-32 mx-auto skeleton-base rounded mb-2" /><div className="h-3 w-24 mx-auto skeleton-base rounded" /></div><SkeletonStatsInner /></div>
}

export const SkeletonCard = memo(SkeletonCardInner)
export const SkeletonList = memo(SkeletonListInner)
export const SkeletonGrid = memo(SkeletonGridInner)
export const SkeletonStats = memo(SkeletonStatsInner)
export const SkeletonProfile = memo(SkeletonProfileInner)
