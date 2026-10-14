# Landing "Guía de talles" → Perfit / Marketing Nube

## Qué hay acá
- `public/index.html`: la landing.
- `public/gracias.html`: la página de gracias.
- `netlify/functions/lead.mjs`: recibe nombre y email y los suma a la lista **Leads MAgnet CM26** (ID 3) de Perfit.
- `netlify.toml`: configuración de Netlify.

## Antes de publicar
- En Marketing Nube, armá la automatización que manda la guía cuando alguien entra a la lista **Leads MAgnet CM26**.

## Publicar en Netlify
1. Subí esta carpeta a un repositorio de GitHub y conectalo en Netlify
   (*Add new site → Import an existing project*).
   El "arrastrar y soltar" de Netlify no activa la función, por eso hace falta GitHub o la CLI.
2. En Netlify: *Site configuration → Environment variables*, cargá una sola variable:
   - `PERFIT_API_KEY` = tu API key
   (La cuenta `sweettallesr` y la lista `3` ya vienen configuradas. Si alguna vez cambian,
   podés pisarlas con `PERFIT_ACCOUNT` y `PERFIT_LIST_ID`.)
3. Volvé a desplegar (*Deploys → Trigger deploy*).
4. Probá suscribirte con un mail tuyo y fijate que aparezca en la lista.

## Dominio
En *Domain management* podés usar un subdominio como `guia.sweettallesreales.com.ar`.

## Si algo falla
En Netlify: *Logs → Functions → lead*. Ahí aparece la respuesta de Perfit.
