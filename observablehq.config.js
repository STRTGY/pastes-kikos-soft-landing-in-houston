// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Soft Landing en Houston | Pastes Kikos",
  pages: [
    {
      name: "0. Introducción",
      path: "/pages/intro",
    },
    {
      name: "1. Centricidad al Consumidor",
      pages: [
        { name: "1.1 Ubicaciones Relevantes", path: "/pages/consumidor/ubicaciones" },
        { name: "1.2 Hábitos de Consumo", path: "/pages/consumidor/habitos" },
        { name: "1.3 Demografía y Comportamiento", path: "/pages/consumidor/demografia" },
        { name: "1.4 Mapas y Hunger Index", path: "/pages/consumidor/mapas" }
      ]
    },
    {
      name: "2. Evaluación de la industria",
      pages: [
        { name: "2.1 Propuesta de Valor", path: "/pages/industria/valor" },
        { name: "2.2 Análisis de Precio", path: "/pages/industria/precios" },
        { name: "2.3 Adaptación de Sabores", path: "/pages/industria/sabores" },
        { name: "2.4 Análisis de Plaza", path: "/pages/industria/plaza" }
      ]
    },
    {
      name: "3. Evaluación de clientes",
      path: "/pages/cliente/evaluacion",
    },
    {
      name: "4. Numeralia y anexos",
      open: false,
      pages: [
        { name: "4.1 Conclusiones", path: "/pages/finales/conclusiones" },
        { name: "4.2 Anexos y Datos", path: "/pages/finales/anexos" }
      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  theme: ["glacier", "wide"], // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
