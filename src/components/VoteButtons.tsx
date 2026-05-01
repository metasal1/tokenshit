'use client';

import dynamic from 'next/dynamic';

const VoteButtonsInner = dynamic(() => import('./VoteButtonsInner'), {
  ssr: false,
  loading: () => (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/80 p-5">
      <div className="text-center mb-4">
        <p className="text-lg font-bold text-white">Is this token 🎯 or 💩?</p>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-h-[100px] rounded-xl border-[3px] border-green-900 bg-green-950" />
        <div className="flex-1 min-h-[100px] rounded-xl border-[3px] border-red-900 bg-red-950" />
      </div>
    </div>
  ),
});

export default function VoteButtons({ assetId }: { assetId: string }) {
  return <VoteButtonsInner assetId={assetId} />;
}
