import { supabase } from "@/integrations/supabase/client";

export interface DhanOptionChainParams {
  UnderlyingScrip: number; // Security ID of underlying (see Dhan instruments CSV)
  UnderlyingSeg: string;   // e.g. "IDX_I" for index options
  Expiry?: string;         // YYYY-MM-DD (required for optionchain, not for expirylist)
}

export interface DhanApiError {
  error?: string;
  message?: string;
  status?: number;
}

export async function getDhanOptionChain(params: Required<Pick<DhanOptionChainParams, 'UnderlyingScrip' | 'UnderlyingSeg'>> & { Expiry: string }) {
  const { data, error } = await supabase.functions.invoke('dhan-optionchain', {
    body: {
      action: 'optionchain',
      payload: params,
    },
  });

  if (error) throw error;
  return data as unknown; // Dhan returns a structured JSON; keep generic for now
}

export async function getDhanExpiryList(params: Required<Pick<DhanOptionChainParams, 'UnderlyingScrip' | 'UnderlyingSeg'>>) {
  const { data, error } = await supabase.functions.invoke('dhan-optionchain', {
    body: {
      action: 'expirylist',
      payload: params,
    },
  });

  if (error) throw error;
  return data as unknown;
}
