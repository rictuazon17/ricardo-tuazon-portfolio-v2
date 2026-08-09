/* Compatibility loader for the production JavaScript bundle. */
(() => {
  if (window.__ricardoPortfolioScriptLoaded) return;
  window.__ricardoPortfolioScriptLoaded = true;

  const script = document.createElement("script");
  script.src = "/script.js";
  script.defer = true;
  document.head.appendChild(script);
})();
