import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
        // Get all demo accounts for the user
        const { data: accounts, error } = await supabase
          .from('demo_accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching demo accounts:', error);
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
        const { account_name, initial_balance } = await req.json();

        if (!account_name || initial_balance < 5000 || initial_balance > 250000) {
          return new Response(JSON.stringify({ 
            error: 'Invalid account name or balance (₹5,000 - ₹2,50,000)' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user's full name for hash generation
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          return new Response(JSON.stringify({ error: 'User profile not found' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Generate hash ID using the database function
        const { data: hashResult, error: hashError } = await supabase
          .rpc('generate_hash_id', { first_name: userData.full_name });

        if (hashError) {
          console.error('Error generating hash ID:', hashError);
          return new Response(JSON.stringify({ error: 'Failed to generate account ID' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create demo account
        const { data: account, error } = await supabase
          .from('demo_accounts')
          .insert({
            user_id: user.id,
            hash_id: hashResult,
            account_name,
            balance: initial_balance,
            initial_balance,
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating demo account:', error);
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
        const { account_id, action, amount } = await req.json();

        if (!account_id || !action) {
          return new Response(JSON.stringify({ error: 'Missing account_id or action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let updateData: any = {};

        switch (action) {
          case 'activate':
            updateData = { status: 'active' };
            break;
          case 'dump':
            updateData = { status: 'dumped' };
            break;
          case 'add_funds':
            if (!amount || amount <= 0) {
              return new Response(JSON.stringify({ error: 'Invalid amount' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            
            // Get current balance
            const { data: currentAccount, error: fetchError } = await supabase
              .from('demo_accounts')
              .select('balance')
              .eq('id', account_id)
              .eq('user_id', user.id)
              .single();

            if (fetchError || !currentAccount) {
              return new Response(JSON.stringify({ error: 'Account not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            const newBalance = parseFloat(currentAccount.balance) + amount;
            if (newBalance > 250000) {
              return new Response(JSON.stringify({ error: 'Maximum balance limit exceeded (₹2,50,000)' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            updateData = { balance: newBalance };
            break;
          default:
            return new Response(JSON.stringify({ error: 'Invalid action' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { data: updatedAccount, error } = await supabase
          .from('demo_accounts')
          .update(updateData)
          .eq('id', account_id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating demo account:', error);
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

        if (!account_id) {
          return new Response(JSON.stringify({ error: 'Missing account_id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('demo_accounts')
          .delete()
          .eq('id', account_id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting demo account:', error);
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