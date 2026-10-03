/**
 * Datos de contacto y redes sociales de Oro Nacional.
 *
 * Fuente única para los valores por defecto: se usan como respaldo cuando la
 * configuración de la tienda (store_settings) aún no se ha cargado o no está
 * disponible, y en metadatos / JSON-LD que no leen la base de datos.
 */
export const SITE_CONTACT = {
  phone: "3326363714",
  phoneDisplay: "33 2636 3714",
  phoneE164: "+523326363714",
  phoneHref: "tel:+523326363714",
  email: "hola@oronacional.com",
  emailHref: "mailto:hola@oronacional.com",
  streetAddress: "Magno centro joyero, San Juan de Dios interior #4041",
  city: "Guadalajara",
  state: "Jalisco",
  countryCode: "MX",
  mapsUrl: "https://maps.app.goo.gl/GBnsUNi5fe9QNEDj8",
  website: "www.oronacional.com",
  facebookUrl: "https://www.facebook.com/profile.php?id=61579417826319",
  instagramUrl: "https://www.instagram.com/nacionaloro/",
  instagramHandle: "@nacionaloro",
} as const;

/**
 * Horario de la tienda tal como se muestra en la página de contacto
 * (contact.hoursWeekdays / hoursSaturday / hoursSunday). Domingo: cerrado.
 */
export const SITE_OPENING_HOURS = [
  {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "10:00",
    closes: "19:00",
  },
  { days: ["Saturday"], opens: "10:00", closes: "15:00" },
] as const;
