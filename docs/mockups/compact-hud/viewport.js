const params = new URLSearchParams(location.search);
const width = params.get("width") === "1920" ? 1920 : 1280;
const height = width === 1920 ? 1080 : 720;
const frame = document.querySelector("iframe");
frame.width = String(width);
frame.height = String(height);
frame.src = `index.html?scale=${params.get("scale") === "150" ? "150" : "100"}&mode=${params.get("mode") === "before" ? "before" : "proposed"}`;
function fit() {
  frame.style.transform = `scale(${Math.min(innerWidth / width, innerHeight / height)})`;
}
addEventListener("resize", fit);
fit();
frame.addEventListener("load", () => {
  const doc = frame.contentDocument;
  function report() {
    const top = doc.querySelector(".top-area");
    const scene = doc.querySelector(".unified-scene");
    if (!top || !scene) return;
    const result = {
      width,
      height,
      scale: doc.documentElement.dataset.uiScale,
      mode: doc.querySelector(".mockup").classList.contains("before")
        ? "before"
        : "proposed",
      top: top.getBoundingClientRect().height,
      scene: scene.getBoundingClientRect().height,
      overflow: doc.documentElement.scrollWidth > width,
      clippedTopControls: [...top.querySelectorAll("button")].filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          (r.left < 0 ||
            r.right > width ||
            r.top < 0 ||
            r.bottom > top.getBoundingClientRect().bottom + 1)
        );
      }).length,
    };
    document.querySelector("#metrics").textContent = JSON.stringify(result);
  }
  new MutationObserver(report).observe(doc.body, {
    subtree: true,
    childList: true,
    attributes: true,
  });
  new ResizeObserver(report).observe(doc.body);
  report();
});
