import { notFound } from "next/navigation";

// Cualquier ruta que no exista dentro del locale muestra la página 404 del sitio
export default function CatchAllPage() {
  notFound();
}
