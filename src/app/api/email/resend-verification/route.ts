import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailConfirmation } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const { email, name, locale = 'es' } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Si tenemos service role key, generamos el link y enviamos email branded
    if (supabaseUrl && serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (error || !data?.properties?.action_link) {
        // Fallback: resend con Supabase anon client
        const { createClient: createAnonClient } = await import('@supabase/supabase-js');
        const anonClient = createAnonClient(
          supabaseUrl,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await anonClient.auth.resend({ type: 'signup', email });
        return NextResponse.json({ success: true });
      }

      const confirmationUrl = data.properties.action_link;
      const customerName = name || email.split('@')[0];

      await sendEmailConfirmation(customerName, email, confirmationUrl, locale as 'es' | 'en');

      return NextResponse.json({ success: true });
    }

    // Sin service role key: usar Supabase resend estándar (envía el email de Supabase)
    const { createClient: createAnonClient } = await import('@supabase/supabase-js');
    const anonClient = createAnonClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: resendError } = await anonClient.auth.resend({ type: 'signup', email });

    if (resendError) {
      return NextResponse.json({ success: false, error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in resend-verification:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
