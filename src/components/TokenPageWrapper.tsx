"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SwipeableToken from "./SwipeableToken";

export default function TokenPageWrapper({ assetId, children }: { assetId: string; children: React.ReactNode }) {
  const [prev, setPrev] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch(`/api/adjacent-tokens?assetId=${encodeURIComponent(assetId)}`)
      .then(r => r.json())
      .then(d => {
        setPrev(d.prev || null);
        setNext(d.next || null);
      })
      .catch(() => {});
  }, [assetId, pathname]);

  return (
    <SwipeableToken prevAssetId={prev} nextAssetId={next}>
      {children}
    </SwipeableToken>
  );
}
