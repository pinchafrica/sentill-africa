"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssetModal from "@/components/AssetModal";

export default function AssetModalWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const logAssetParam = searchParams.get("logAsset");
  
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>();

  useEffect(() => {
    if (logAssetParam) {
      setIsOpen(true);
      if (logAssetParam !== "true") {
        setPrefilledAsset(logAssetParam);
      }
      
      // Clean up the URL without a full page reload so it doesn't re-trigger on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [logAssetParam]);

  return (
    <AssetModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      prefilledAsset={prefilledAsset} 
    />
  );
}
