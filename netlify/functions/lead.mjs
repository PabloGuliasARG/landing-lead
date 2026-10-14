// Recibe { nombre, email } desde la landing y lo suma a una lista de Perfit / Marketing Nube.
// Las claves NO van acá: se cargan como variables de entorno en Netlify.
//   PERFIT_API_KEY  → la API key del usuario de Perfit
//   PERFIT_ACCOUNT  → opcional, por defecto "sweettallesr"
//   PERFIT_LIST_ID  → opcional, por defecto 3 (lista "Leads MAgnet CM26")

const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "Método no permitido" });

  let datos;
  try {
    datos = await req.json();
  } catch {
    return json(400, { ok: false, error: "JSON inválido" });
  }

  const email = String(datos.email || "").trim().toLowerCase();
  const nombre = String(datos.nombre || "").trim().slice(0, 80);
  if (!reEmail.test(email)) return json(400, { ok: false, error: "Email inválido" });

  // Trampa anti-bots: si este campo oculto viene completo, es un bot.
  if (datos.web) return json(200, { ok: true });

  const PERFIT_API_KEY = process.env.PERFIT_API_KEY;
  const PERFIT_ACCOUNT = process.env.PERFIT_ACCOUNT || "sweettallesr";
  const PERFIT_LIST_ID = process.env.PERFIT_LIST_ID || "3"; // Lista "Leads MAgnet CM26"
  if (!PERFIT_API_KEY || !PERFIT_ACCOUNT || !PERFIT_LIST_ID) {
    console.error("Faltan variables de entorno de Perfit");
    return json(500, { ok: false, error: "Configuración incompleta" });
  }

  const url = `https://api.myperfit.com/v2/${PERFIT_ACCOUNT}/lists/${PERFIT_LIST_ID}/contacts`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERFIT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, firstName: nombre }),
    });

    if (!r.ok) {
      const detalle = await r.text().catch(() => "");
      console.error("Perfit respondió", r.status, detalle.slice(0, 500));
      return json(502, { ok: false, error: "No se pudo registrar" });
    }
    return json(200, { ok: true });
  } catch (e) {
    console.error("Error llamando a Perfit", e);
    return json(502, { ok: false, error: "No se pudo registrar" });
  }
};

export const config = { path: "/api/lead" };
