"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function RoastPollingClient({ id }: { id: string }) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.submission.getById.queryOptions(
      { id },
      {
        refetchInterval: (query) => {
          return query.state.data?.status === "pending" ? 2000 : false;
        },
      }
    )
  );

  useEffect(() => {
    if (data?.status === "processed" || data?.status === "failed") {
      router.refresh();
    }
  }, [data?.status, router]);

  return null;
}
