# Hamburguesa de Barrio — sitio web

Sitio de una sola página para **Hamburguesa de Barrio** (Berisso, Buenos Aires): carta, papas y extras, info del local, horario y ubicación.

## Estructura

```
hdb-site/
├── index.html      → contenido y estructura de la página
├── css/style.css   → estilos (colores, tipografía, layout)
├── js/script.js    → menú móvil, botón "volver arriba", año del footer
└── README.md
```

No usa frameworks ni build tools: es HTML, CSS y JS puro. Se puede abrir `index.html` directo en el navegador para probarlo.

## Publicarlo en GitHub Pages

Ver instrucciones detalladas en la conversación con Claude, o seguir estos pasos:

1. Crear un repositorio nuevo en GitHub (por ejemplo `hamburguesa-de-barrio`).
2. Subir estos archivos al repositorio.
3. En el repo: **Settings → Pages → Source → Deploy from a branch**, elegir la rama `main` y la carpeta `/ (root)`.
4. Esperar 1-2 minutos: el sitio queda publicado en `https://<tu-usuario>.github.io/hamburguesa-de-barrio/`.

## Personalizar

- **Precios y carta**: editar directamente el texto dentro de `index.html`, dentro de cada `<article class="burger-card">`.
- **Colores**: cambiar los valores en `:root` al principio de `css/style.css` (por ejemplo `--gold`, `--ember`).
- **Fotos reales**: si más adelante querés sumar fotos del local o de las hamburguesas, se pueden agregar en una carpeta `assets/` y referenciarlas con `<img>` dentro de las tarjetas del menú.
