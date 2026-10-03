import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailConfirmation } from '@/lib/email/resend';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

// Límite de envíos simple en memoria.
// NOTA: es por instancia de servidor (en serverless cada instancia tiene su
// propio contador y se reinicia en cada cold start). Reduce el abuso básico,
// pero para un límite estricto se necesita un almacén compartido (Redis/KV).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 5;
const MAX_TRACKED_KEYS = 5000;
const rateLimitHits = new Map<string, number[]>();

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const recent = (rateLimitHits.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recent.length >= max) {
    rateLimitHits.set(key, recent);
    return true;
  }

  recent.push(now);
  rateLimitHits.set(key, recent);

  // Evitar que el mapa crezca sin límite
  if (rateLimitHits.size > MAX_TRACKED_KEYS) {
    for (const [storedKey, timestamps] of rateLimitHits) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitHits.delete(storedKey);
      }
    }
  }

  return false;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// La respuesta es idéntica exista o no la cuenta (no revelar qué correos están registrados)
const genericSuccess = () => NextResponse.json({ success: true });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const rawEmail = body && typeof body.email === 'string' ? body.email : '';
    const email = rawEmail.trim().toLowerCase();
    const locale: 'es' | 'en' = body?.locale === 'en' ? 'en' : 'es';
    // El `name` enviado por el cliente se ignora a propósito: el saludo usa
    // el nombre guardado en el perfil, para que nadie pueda inyectar texto
    // en un correo enviado desde nuestro dominio.

    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    if (
      isRateLimited(`ip:${getClientIp(request)}`, MAX_PER_IP) ||
      isRateLimited(`email:${email}`, MAX_PER_EMAIL)
    ) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey) {
      console.error('resend-verification: Supabase environment variables are missing');
      return genericSuccess();
    }

    // Reenvío estándar de Supabase (correo de Supabase, sin diseño propio).
    // Supabase solo lo envía a cuentas existentes sin confirmar.
    const resendWithSupabase = async () => {
      const anonClient = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await anonClient.auth.resend({ type: 'signup', email });
      if (error) {
        console.error('resend-verification: Supabase resend failed:', error.message);
      }
    };

    // Sin service role key: usar el reenvío estándar de Supabase
    if (!serviceRoleKey) {
      await resendWithSupabase();
      return genericSuccess();
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Solo se envía a cuentas que existen y aún no están confirmadas
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error('resend-verification: profile lookup failed:', profileError.message);
      return genericSuccess();
    }

    if (!profile) {
      return genericSuccess();
    }

    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(profile.id);

    if (userError || !userData?.user || userData.user.email_confirmed_at) {
      return genericSuccess();
    }

    // Enlace de confirmación de registro (no un magic link de inicio de sesión).
    // La API exige `password` para type 'signup', pero para un usuario que ya
    // existe y no está confirmado GoTrue no modifica su contraseña; se envía
    // un valor aleatorio que nunca se usa.
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email,
      password: `${randomBytes(24).toString('base64url')}aA1!`,
    });

    if (error || !data?.properties?.action_link) {
      if (error) {
        console.error('resend-verification: generateLink failed:', error.message);
      }
      await resendWithSupabase();
      return genericSuccess();
    }

    const storedName = typeof profile.full_name === 'string' ? profile.full_name.trim() : '';
    const customerName = storedName || email.split('@')[0];

    const result = await sendEmailConfirmation(
      customerName,
      email,
      data.properties.action_link,
      locale
    );

    if (!result.success) {
      console.error('resend-verification: email send failed:', result.error);
    }

    return genericSuccess();
  } catch (error) {
    console.error('Error in resend-verification:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
