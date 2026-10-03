# Plantillas de correo de Supabase Auth - Oro Nacional

Correos que envía Supabase directamente (no pasan por la app). Tienen el mismo
diseño que los correos de la app (`emails/components/email-layout.tsx`): logo,
acentos dorados `#D4AF37` y pie con los datos de contacto.

Supabase permite una sola versión por plantilla, así que cada una es bilingüe:
español arriba e inglés debajo.

## Cómo instalarlas

Supabase **no** las toma del repositorio: hay que pegarlas a mano.

1. Dashboard de Supabase → **Authentication → Email Templates**.
2. En cada plantilla, pega el asunto y el contenido completo del archivo HTML.
3. Guarda y envíate una prueba.

| Plantilla en Supabase | Archivo | Asunto sugerido |
|---|---|---|
| Confirm signup | `confirm-signup.html` | Confirma tu cuenta · Confirm your account — Oro Nacional |
| Reset Password | `reset-password.html` | Restablece tu contraseña · Reset your password — Oro Nacional |
| Magic Link | `magic-link.html` | Tu enlace de acceso · Your sign-in link — Oro Nacional |
| Invite user | `invite-user.html` | Invitación a Oro Nacional · Invitation to Oro Nacional |
| Change Email Address | `change-email.html` | Confirma tu nuevo correo · Confirm your new email — Oro Nacional |
| Reauthentication | `reauthentication.html` | Código de verificación · Verification code — Oro Nacional |

## Notas

- El logo se carga desde `https://www.oronacional.com/logos/logo-oro-nacional-email.png`,
  así que ese archivo debe estar desplegado.
- Variables de Supabase usadas: `{{ .ConfirmationURL }}`; en el cambio de
  correo, `{{ .Email }}` y `{{ .NewEmail }}`; en la reautenticación, `{{ .Token }}`
  (un código, sin enlace).
- Para que el enlace de "Reset Password" llegue a la página correcta, agrega
  `https://www.oronacional.com/update-password` y
  `https://www.oronacional.com/en/update-password` en
  **Authentication → URL Configuration → Redirect URLs**.
- Si cambian los datos de contacto, actualiza también `src/lib/site-contact.ts`.
