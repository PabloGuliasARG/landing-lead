// Página /videos protegida con contraseña.
// La clave y los videos NO van acá (el repositorio es público): se cargan en Netlify,
// en Project configuration → Environment variables:
//   VIDEOS_CLAVE → la contraseña que reciben los clientes por mail
//   VIDEO_1 ... VIDEO_8 → "Título | link de YouTube"  (ej: "Cómo medir el busto | https://youtu.be/abc123")
// También se puede entrar directo con el link: /videos?clave=LACLAVE

import { createHash } from "node:crypto";

const COOKIE = "acceso_videos";
const DIAS = 180;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const ficha = (clave) => createHash("sha256").update("sweet-videos:" + clave).digest("hex");

const idYoutube = (link) => {
  const m = String(link).match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(link.trim()) ? link.trim() : null;
};

const videos = () => {
  const lista = [];
  for (let i = 1; i <= 8; i++) {
    const v = (process.env[`VIDEO_${i}`] || "").trim().replace(/^["']|["']$/g, "");
    if (!v) continue;
    const corte = v.lastIndexOf("|");
    const titulo = corte >= 0 ? v.slice(0, corte).trim() : `Video ${i}`;
    const id = idYoutube(corte >= 0 ? v.slice(corte + 1) : v);
    if (id) lista.push({ titulo, id, vertical: /\/shorts\//.test(v) });
  }
  return lista;
};

const pagina = (titulo, contenido) => `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} — Sweet Talles Reales</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#C8102E">
<style>
  :root{
    --rojo:#C8102E; --rojo-osc:#9E0C24; --rosa:#C9989A; --rosa-claro:#F3E3E1;
    --texto:#2B1A1C; --suave:#6E5153; --blanco:#FFFFFF; --radio:14px;
    --serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;
    --sans:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:var(--blanco);color:var(--texto);font:17px/1.55 var(--sans)}
  :focus-visible{outline:3px solid var(--texto);outline-offset:3px;border-radius:4px}
  .cinta{height:34px;position:relative;
    background:
      repeating-linear-gradient(90deg,var(--texto) 0 2px,transparent 2px 50px) 0 0/100% 18px no-repeat,
      repeating-linear-gradient(90deg,var(--texto) 0 1px,transparent 1px 10px) 0 0/100% 9px no-repeat,
      var(--rosa-claro);
    border-bottom:2px solid var(--rojo)}
  .cinta::after{content:"";position:absolute;top:0;bottom:0;right:0;width:4px;background:var(--rojo)}
  .wrap{max-width:760px;margin:0 auto;padding:0 20px;width:100%}
  .angosto{max-width:460px}
  header{padding:18px 0 0}
  .logo{font-family:var(--serif);font-size:20px;color:var(--rojo);font-weight:700}
  .logo span{font-family:var(--sans);font-weight:500;font-size:12px;letter-spacing:.18em;text-transform:uppercase;display:block;color:var(--suave)}
  main{flex:1;padding:30px 0 56px}
  .medida{font-size:13px;font-weight:700;letter-spacing:.12em;color:var(--rojo);text-transform:uppercase;margin:0 0 8px}
  h1{font-family:var(--serif);font-size:clamp(32px,8vw,46px);line-height:1.08;margin:0 0 14px}
  .intro{color:var(--suave);margin:0 0 28px}
  .caja{background:var(--rosa-claro);border:2px solid var(--rojo);border-radius:var(--radio);padding:20px;box-shadow:6px 6px 0 var(--rosa)}
  label{display:block;font-weight:700;margin:0 0 6px}
  input{width:100%;font:inherit;padding:14px;border:2px solid var(--texto);border-radius:10px;background:#fff;color:var(--texto);min-height:52px}
  button{margin-top:14px;width:100%;font:inherit;font-weight:700;font-size:18px;background:var(--rojo);color:#fff;border:0;border-radius:12px;padding:16px;min-height:56px;cursor:pointer}
  button:hover{background:var(--rojo-osc)}
  .error{color:var(--rojo-osc);font-weight:700;margin:12px 0 0}
  .ayuda{font-size:14px;color:var(--suave);margin:14px 0 0}
  ol{list-style:none;margin:0;padding:0;display:grid;gap:34px;counter-reset:v}
  li{counter-increment:v}
  h2{font-family:var(--serif);font-size:22px;line-height:1.2;margin:0 0 10px;display:flex;gap:10px;align-items:baseline}
  h2::before{content:counter(v);font-family:var(--sans);font-size:13px;font-weight:700;color:#fff;background:var(--rojo);border-radius:99px;min-width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;flex:none;transform:translateY(-3px)}
  .video{position:relative;aspect-ratio:16/9;border:2px solid var(--texto);border-radius:var(--radio);overflow:hidden;background:#000;box-shadow:6px 6px 0 var(--rosa)}
  .video.vertical{aspect-ratio:9/16;max-width:360px}
  .video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .vacio{color:var(--suave)}
</style>
</head>
<body>
<div class="cinta" aria-hidden="true"></div>
<header><div class="wrap"><div class="logo">Sweet<span>talles reales</span></div></div></header>
<main>${contenido}</main>
</body>
</html>`;

const login = (error) =>
  pagina(
    "Acceso a los videos",
    `<div class="wrap angosto">
  <p class="medida">Contenido exclusivo</p>
  <h1>Videos: cómo medir correctamente</h1>
  <p class="intro">Ingresá la clave que te llegó por mail.</p>
  <form class="caja" method="post" action="/videos">
    <label for="clave">Clave</label>
    <input id="clave" name="clave" type="password" autocomplete="current-password" required autofocus>
    ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ""}
    <button type="submit">Ver los videos</button>
    <p class="ayuda">¿No encontrás el mail? Revisá la carpeta de spam o promociones.</p>
  </form>
</div>`
  );

const listado = () => {
  const lista = videos();
  const items = lista.length
    ? `<ol>${lista
        .map(
          (v) => `<li><h2>${esc(v.titulo)}</h2>
      <div class="video${v.vertical ? " vertical" : ""}"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1" title="${esc(v.titulo)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></li>`
        )
        .join("\n")}</ol>`
    : `<p class="vacio">Todavía no hay videos cargados.</p>`;
  return pagina(
    "Videos",
    `<div class="wrap">
  <p class="medida">Medida tomada ✓</p>
  <h1>Cómo medir correctamente</h1>
  <p class="intro">Mirá los videos en orden. Podés volver a esta página cuando quieras.</p>
  ${items}
</div>`
  );
};

const html = (body, status = 200, extra = {}) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      ...extra,
    },
  });

const cookieOk = (req, valor) =>
  (req.headers.get("cookie") || "").split(/;\s*/).some((c) => c === `${COOKIE}=${valor}`);

const conAcceso = (valor) => ({
  "Set-Cookie": `${COOKIE}=${valor}; Path=/videos; Max-Age=${DIAS * 86400}; HttpOnly; Secure; SameSite=Lax`,
  Location: "/videos",
});

export default async (req) => {
  const CLAVE = (process.env.VIDEOS_CLAVE || "").trim();
  return html(listado()); // Sin clave: los videos se ven directo
  const valor = ficha(CLAVE);
  const url = new URL(req.url);

  if (req.method === "POST") {
    const form = await req.formData().catch(() => null);
    const clave = String(form?.get("clave") || "").trim();
    if (clave === CLAVE) return new Response(null, { status: 303, headers: conAcceso(valor) });
    return html(login("Esa clave no es correcta. Copiala tal cual del mail."), 401);
  }

  // Link directo: /videos?clave=...
  const enLink = url.searchParams.get("clave");
  if (enLink !== null) {
    if (enLink.trim() === CLAVE) return new Response(null, { status: 303, headers: conAcceso(valor) });
    return html(login("El link tiene una clave incorrecta. Escribila a mano."), 401);
  }

  if (cookieOk(req, valor)) return html(listado());
  return html(login());
};

export const config = { path: ["/videos", "/videos/"] };
