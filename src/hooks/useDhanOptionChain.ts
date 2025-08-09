import { useQuery } from "@tanstack/react-query";
import { getDhanExpiryList, getDhanOptionChain } from "@/services/dhanAPI";

interface UseDhanOptionChainArgs {
  underlyingScrip: number;
  underlyingSeg: string; // e.g. IDX_I
  expiry?: string;       // when omitted, hook fetches expiry list first
}

export function useDhanOptionChain({ underlyingScrip, underlyingSeg, expiry }: UseDhanOptionChainArgs) {
  const expiryListQuery = useQuery({
    queryKey: ['dhan', 'expirylist', underlyingScrip, underlyingSeg],
    queryFn: () => getDhanExpiryList({ UnderlyingScrip: underlyingScrip, UnderlyingSeg: underlyingSeg }),
    enabled: !expiry && !!underlyingScrip && !!underlyingSeg,
    staleTime: 15_000,
    refetchInterval: 10_000,
  });

  const expiries = (expiryListQuery.data as any)?.expiries as string[] | undefined;
  const selectedExpiry = expiry ?? (Array.isArray(expiries) ? expiries[0] : undefined);

  const optionChainQuery = useQuery({
    queryKey: ['dhan', 'optionchain', underlyingScrip, underlyingSeg, selectedExpiry],
    queryFn: () => getDhanOptionChain({ UnderlyingScrip: underlyingScrip, UnderlyingSeg: underlyingSeg, Expiry: selectedExpiry as string }),
    enabled: !!underlyingScrip && !!underlyingSeg && !!selectedExpiry,
    refetchInterval: 3_000,
  });

  return {
    expiryListQuery,
    optionChainQuery,
    selectedExpiry,
  };
}
