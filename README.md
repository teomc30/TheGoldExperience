# D'or Essence — Perfumes & Decants

Tienda web estática de perfumes (botellas selladas y decants) con pedidos por WhatsApp y una sección de *Mystery Boxes* con ruleta animada.

🌐 **Sitio en vivo:** https://dioressence.freedynamicdns.net

No usa backend, base de datos ni proceso de build: es HTML + JavaScript plano, con Tailwind CSS cargado por CDN, publicado en GitHub Pages.

---

## Funcionalidades

- **Catálogo** con filtros por tipo, categoría, género, concentración y precio, más búsqueda.
- **Detalle del producto** en un modal: notas, acordes y variantes de tamaño/precio.
- **Carrito** lateral con cantidades; el pedido se envía como mensaje prellenado a WhatsApp (`wa.me`).
- **Badges** de estado: Top Seller, Oferta, Rare, Vendido y Próximamente.
- **Mystery Boxes** (`pages/mystery-boxes.html`): ruleta que elige un perfume del catálogo según su rareza.

## Estructura

```
├── index.html               # Página principal (catálogo, carrito, modales)
├── pages/
│   └── mystery-boxes.html   # Ruleta de Mystery Boxes
├── js/
│   ├── config.js            # Número de build y número de WhatsApp
│   ├── products.js          # Catálogo de productos (productsBase)
│   ├── app.js               # Filtros, render, carrito y checkout por WhatsApp
│   └── box-logic.js         # Animación y lógica de la ruleta
├── css/styles.css           # Estilos propios (complementa a Tailwind)
├── assets/images/           # Imágenes locales de productos
└── CNAME                    # Dominio personalizado de GitHub Pages
```

## Ejecutar en local

No hace falta instalar nada. Basta con servir la carpeta con cualquier servidor estático:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node
npx serve .
```

Luego abrir http://localhost:8000. (Abrir `index.html` con doble clic también funciona en la mayoría de navegadores.)

## Agregar o editar productos

Todo el catálogo vive en [`js/products.js`](js/products.js), dentro del arreglo `productsBase`. Al inicio del archivo hay una **plantilla comentada** con todos los campos; cópiala y rellénala.

Campos principales:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | number | **Único** y obligatorio |
| `name`, `house` | string | Obligatorios |
| `category` | string | `Arabe`, `Diseñador`, `Nicho`… |
| `type` | string | p. ej. `Decant`, `Botella Sellada` |
| `concentration` | string | `EDT`, `EDP`, `Parfum`… |
| `gender` | array | `["Hombre"]`, `["Mujer"]` o `["Hombre", "Mujer"]` |
| `price3`, `price5`, `price10`, `price15`, `price100` | number | Precios de decant por ml (usa solo los que apliquen) |
| `pricefull`, `pricefull50`, `pricefull100`, `pricefull200` | number | Botella completa (con o sin tamaño) |
| `soldOut`, `comingSoon` | boolean | Bloquean la compra |
| `topSeller`, `sale`, `rare` | boolean | Badges visuales |
| `rarity` | string | `comun`, `raro` o `legendario` (Mystery Boxes) |
| `imgUrl` | string | Imagen del producto (obligatoria) |
| `accordBars` | array | Barras de acordes: `{ name, color, width }` |

**Imágenes:** se prefieren fotos estilizadas o de ambiente. Si el enlace externo es inestable, descarga la imagen a `assets/images/` y referénciala con ruta relativa (`assets/images/nombre.jpg`).

Los precios se muestran en soles (S/).

## Configuración

[`js/config.js`](js/config.js):

```js
window.APP_CONFIG = {
    build: '20261029a',        // versión para romper la caché
    whatsappNumber: '51...'    // número que recibe los pedidos (con código de país, sin +)
};
```

## Publicar cambios

El sitio se despliega automáticamente con **GitHub Pages** desde la rama `main`.

1. Haz tus cambios (productos, estilos, etc.).
2. **Sube el valor de `build`** en `js/config.js` (formato sugerido `AAAAMMDD` + letra, p. ej. `20261125a`). Los scripts se cargan como `archivo.js?v=<build>`, así que este paso obliga a los navegadores a descargar la versión nueva en lugar de usar la caché.
3. Commit y push a `main`.
4. Espera a que termine el despliegue de Pages (pestaña *Actions* del repo) y verifica en el sitio.

## Dominio

El dominio `dioressence.freedynamicdns.net` se gestiona en No-IP y apunta a GitHub Pages; el archivo `CNAME` debe permanecer en la raíz del repo. Si se borra, Pages pierde el dominio personalizado.

## Tecnologías

- HTML5 + JavaScript (vanilla)
- [Tailwind CSS](https://tailwindcss.com) vía CDN
- [Font Awesome 6](https://fontawesome.com) y Google Fonts (Cinzel, Montserrat)
- GitHub Pages
