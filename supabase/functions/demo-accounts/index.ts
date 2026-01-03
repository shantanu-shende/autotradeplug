import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACCOUNT_NAME_REGEX = /^[a-zA-Z0-9\s\-_]+$/;

function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function isValidAccountName(value: unknown): value is string {
  return typeof value === 'string' && 
         value.length >= 1 && 
         value.length <= 50 && 
         ACCOUNT_NAME_REGEX.test(value);
}

function isValidBalance(value: unknown): value is number {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= 5000 && 
         value <= 250000;
}

function isValidAction(value: unknown): value is 'activate' | 'dump' | 'add_funds' {
  return typeof value === 'string' && ['activate', 'dump', 'add_funds'].includes(value);
}

function isValidAmount(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (req.method) {
      case 'GET': {
        // Get all brokers for the user (using existing table)
        const { data: accounts, error } = await supabase
          .from('brokers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching accounts:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ accounts }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'POST': {
        let body;
        try {
          body = await req.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { account_name, initial_balance } = body;

        // Validate inputs
        if (!isValidAccountName(account_name)) {
          return new Response(JSON.stringify({ 
            error: 'Invalid account name. Must be 1-50 characters, alphanumeric with spaces, hyphens, or underscores.' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!isValidBalance(initial_balance)) {
          return new Response(JSON.stringify({ 
            error: 'Invalid balance. Must be a number between ₹5,000 and ₹2,50,000.' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user's profile for display name
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();

        // Generate a simple hash ID
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}`;
        const randomHash = Math.floor(1000 + Math.random() * 9000).toString();
        const namePrefix = (userData?.display_name || 'USR').substring(0, 3).toUpperCase();
        const hashId = `${namePrefix}-${dateStr}-${randomHash}`;

        // Create broker entry as demo account
        const { data: account, error } = await supabase
          .from('brokers')
          .insert({
            user_id: user.id,
            broker_name: account_name,
            status: 'connected',
            metadata: { 
              initial_balance, 
              balance: initial_balance,
              hash_id: hashId,
              is_demo: true 
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating account:', error);
          return new Response(JSON.stringify({ error: 'Failed to create account' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ account }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'PUT': {
        let body;
        try {
          body = await req.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { account_id, action, amount } = body;

        // Validate inputs
        if (!isValidUUID(account_id)) {
          return new Response(JSON.stringify({ error: 'Invalid account_id format' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!isValidAction(action)) {
          return new Response(JSON.stringify({ error: 'Invalid action. Must be one of: activate, dump, add_funds' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let updateData: Record<string, unknown> = {};

        switch (action) {
          case 'activate':
            updateData = { status: 'connected' };
            break;
          case 'dump':
            updateData = { status: 'disconnected' };
            break;
          case 'add_funds':
            if (!isValidAmount(amount)) {
              return new Response(JSON.stringify({ error: 'Invalid amount. Must be a positive number.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            
            // Get current balance from metadata
            const { data: currentAccount, error: fetchError } = await supabase
              .from('brokers')
              .select('metadata')
              .eq('id', account_id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (fetchError || !currentAccount) {
              return new Response(JSON.stringify({ error: 'Account not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            const currentMetadata = currentAccount.metadata as Record<string, unknown> || {};
            const currentBalance = typeof currentMetadata.balance === 'number' ? currentMetadata.balance : 0;
            const newBalance = currentBalance + amount;
            
            if (newBalance > 250000) {
              return new Response(JSON.stringify({ error: 'Maximum balance limit exceeded (₹2,50,000)' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            updateData = { 
              metadata: { 
                ...currentMetadata, 
                balance: newBalance 
              } 
            };
            break;
        }

        const { data: updatedAccount, error } = await supabase
          .from('brokers')
          .update(updateData)
          .eq('id', account_id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating account:', error);
          return new Response(JSON.stringify({ error: 'Failed to update account' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ account: updatedAccount }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'DELETE': {
        const url = new URL(req.url);
        const account_id = url.searchParams.get('account_id');

        if (!isValidUUID(account_id)) {
          return new Response(JSON.stringify({ error: 'Invalid or missing account_id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('brokers')
          .delete()
          .eq('id', account_id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting account:', error);
          return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in demo-accounts function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
