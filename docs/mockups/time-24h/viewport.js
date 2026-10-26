const iframe = document.querySelector("iframe");
const size = document.querySelector("#size");
const scale = document.querySelector("#scale");
const profileOnly = new URLSearchParams(location.search).has("profile");
const stopPlayback = () => {
  const button = iframe.contentDocument.querySelector(".buttons .primary");
  if (button?.textContent.includes("Tạm dừng")) button.click();
};
function load() {
  const [width, height] = size.value.split(",").map(Number);
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.transform = `scale(${Math.min(1, (document.querySelector("#stage").clientWidth - 10) / width)})`;
  iframe.src = `./?scale=${scale.value}`;
}
function measure() {
  const doc = iframe.contentDocument;
  if (!doc?.querySelector(".comparison")) return;
  const view = iframe.contentWindow;
  const clip = Array.from(
    doc.querySelectorAll(
      ".buttons button, .play-settings button, select, .scenario, .gauge, .cost-line, .wall-light-switch",
    ),
  )
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.left < -1 ||
        rect.right > view.innerWidth + 1 ||
        element.scrollWidth > element.clientWidth + 2
      );
    })
    .map((element) => element.textContent.slice(0, 100));
  const report = {
    width: view.innerWidth,
    height: view.innerHeight,
    scale: view.getComputedStyle(doc.documentElement).fontSize,
    horizontalOverflow: doc.documentElement.scrollWidth > view.innerWidth,
    clipped: clip,
    clock: doc.querySelector('[data-testid="clock"]').textContent,
    canvases: Array.from(doc.querySelectorAll("canvas")).map((canvas) => ({
      width: canvas.width,
      height: canvas.height,
    })),
    pass:
      doc.documentElement.scrollWidth <= view.innerWidth && clip.length === 0,
  };
  document.querySelector("#report").textContent = JSON.stringify(
    report,
    null,
    2,
  );
  if (profileOnly) {
    document.querySelector("#pixels").textContent =
      "Không đọc pixel trong lượt đo nhịp khung; dùng lượt QA riêng.";
    return;
  }
  const scene = doc.querySelector(".scene");
  const canvas = scene.querySelector("canvas");
  const camera = JSON.parse(scene.dataset.camera || "null");
  if (camera && canvas.width) {
    const ctx = canvas.getContext("2d");
    const point = (x, y, z) => ({
      x: camera.x + (x - y) * 65 * camera.zoom,
      y:
        camera.y +
        ((x + y) * 32.5 - z * 65 * Math.SQRT2 * Math.cos(Math.PI / 6)) *
          camera.zoom,
    });
    const sample = (p) => {
      const x = Math.round((p.x * canvas.width) / camera.width),
        y = Math.round((p.y * canvas.height) / camera.height);
      return x >= 0 && y >= 0 && x < canvas.width && y < canvas.height
        ? Array.from(ctx.getImageData(x, y, 1, 1).data)
        : null;
    };
    const clock = JSON.parse(scene.dataset.wallClockPlane || "null");
    let clockRegion = null;
    if (clock) {
      const anchor = point(clock.x, clock.y, clock.z);
      const [a, b, c, d] = clock.basis;
      const corners = [-1, 1].flatMap((u) =>
        [-1, 1].map((v) => ({
          x:
            anchor.x +
            ((a * u * clock.width) / 2 + (c * v * clock.height) / 2) *
              camera.zoom,
          y:
            anchor.y +
            ((b * u * clock.width) / 2 + (d * v * clock.height) / 2) *
              camera.zoom,
        })),
      );
      const ratio = canvas.width / camera.width;
      const left = Math.floor(Math.min(...corners.map((p) => p.x)) * ratio) - 2;
      const top = Math.floor(Math.min(...corners.map((p) => p.y)) * ratio) - 2;
      const width =
        Math.ceil(Math.max(...corners.map((p) => p.x)) * ratio) - left + 2;
      const height =
        Math.ceil(Math.max(...corners.map((p) => p.y)) * ratio) - top + 2;
      if (
        left >= 0 &&
        top >= 0 &&
        left + width <= canvas.width &&
        top + height <= canvas.height
      ) {
        const pixels = ctx.getImageData(left, top, width, height).data;
        let hash = 2166136261,
          bright = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const digit =
            pixels[i] >= 240 && pixels[i + 1] >= 220 && pixels[i + 2] <= 210
              ? 1
              : 0;
          bright += digit;
          hash = Math.imul(hash ^ digit, 16777619) >>> 0;
        }
        clockRegion = {
          left,
          top,
          width,
          height,
          bright,
          signature: hash.toString(16),
          fontCSS: clock.fontSize * camera.zoom,
        };
      }
    }
    document.querySelector("#pixels").textContent = JSON.stringify(
      {
        minute: Number(scene.dataset.lightingMinute),
        camera,
        exterior: sample({ x: 8, y: camera.height - 8 }),
        window: sample(point(1.35, 0.02, 1.2)),
        floor: sample(point(5.4, 8.2, 0.13)),
        floorSeam: sample(point(5, 8, 0.13)),
        actualSky: JSON.parse(canvas.dataset.skyFrame || "null"),
        lamp: sample(point(2.425, 0.035, 1.995)),
        wallClock: scene.dataset.wallClock,
        clockRegion,
        weather: scene.dataset.weather,
        phase: Number(scene.dataset.weatherPhase),
        pairedLighting: Array.from(doc.querySelectorAll(".scene")).map(
          (element) => {
            const surface = element.querySelector("canvas"),
              cam = JSON.parse(element.dataset.camera),
              rect = surface.getBoundingClientRect(),
              button = element.querySelector(".wall-light-switch");
            const at = (x, y, z) => {
              const px = cam.x + (x - y) * 65 * cam.zoom,
                py =
                  cam.y +
                  ((x + y) * 32.5 -
                    z * 65 * Math.SQRT2 * Math.cos(Math.PI / 6)) *
                    cam.zoom;
              const ix = Math.round((px * surface.width) / cam.width),
                iy = Math.round((py * surface.height) / cam.height);
              return ix >= 0 &&
                iy >= 0 &&
                ix < surface.width &&
                iy < surface.height
                ? Array.from(
                    surface.getContext("2d").getImageData(ix, iy, 1, 1).data,
                  )
                : null;
            };
            const bounds = button?.getBoundingClientRect();
            return {
              on: element.dataset.lightsOn,
              pressed: button?.getAttribute("aria-pressed"),
              clock: element.dataset.wallClock,
              sky: JSON.parse(surface.dataset.skyFrame),
              floor: at(5.4, 8.2, 0.13),
              lamp: at(2.425, 0.035, 1.995),
              window: at(1.35, 0.02, 1.2),
              exterior: Array.from(
                surface
                  .getContext("2d")
                  .getImageData(8, surface.height - 8, 1, 1).data,
              ),
              target: bounds
                ? {
                    x: bounds.x - rect.x,
                    y: bounds.y - rect.y,
                    width: bounds.width,
                    height: bounds.height,
                  }
                : null,
            };
          },
        ),
        windowLight: Array.from(doc.querySelectorAll(".scene")).map(
          (element) => {
            const surface = element.querySelector("canvas"),
              cam = JSON.parse(element.dataset.camera);
            const frame = JSON.parse(surface.dataset.windowLight);
            const pixel = (p, z = 0.13) => {
              const x = Math.round(
                ((cam.x + (p.x - p.y) * 65 * cam.zoom) * surface.width) /
                  cam.width,
              );
              const y = Math.round(
                ((cam.y +
                  ((p.x + p.y) * 32.5 -
                    z * 65 * Math.SQRT2 * Math.cos(Math.PI / 6)) *
                    cam.zoom) *
                  surface.height) /
                  cam.height,
              );
              return x >= 0 && y >= 0 && x < surface.width && y < surface.height
                ? Array.from(
                    surface.getContext("2d").getImageData(x, y, 1, 1).data,
                  )
                : null;
            };
            return {
              ...frame,
              lights: element.dataset.lightsOn,
              patches: frame.patches.map((patch) => {
                const center = patch.points.reduce(
                  (a, p) => ({
                    x: a.x + p.x / patch.points.length,
                    y: a.y + p.y / patch.points.length,
                  }),
                  { x: 0, y: 0 },
                );
                return { ...patch, center, pixel: pixel(center) };
              }),
              occluder: pixel({ x: 6.6, y: 2 }, 0.7),
              outside: pixel({ x: 8.2, y: 1 }),
            };
          },
        ),
        monitors: Array.from(doc.querySelectorAll("canvas")).map((surface) => {
          const state = JSON.parse(surface.dataset.monitors || "null");
          const ctx = surface.getContext("2d");
          return {
            ...state,
            tiles: state?.tiles.map((tile) => {
              const pixels = ctx.getImageData(
                tile.x,
                tile.y,
                tile.width,
                tile.height,
              ).data;
              let hash = 2166136261,
                blue = 0;
              for (let i = 0; i < pixels.length; i += 4) {
                for (let c = 0; c < 3; c++)
                  hash = Math.imul(hash ^ pixels[i + c], 16777619) >>> 0;
                if (pixels[i + 2] > pixels[i] + 20 && pixels[i + 1] > 45)
                  blue++;
              }
              return { ...tile, signature: hash.toString(16), blue };
            }),
          };
        }),
        pairedWeather: Array.from(doc.querySelectorAll(".scene")).map(
          (element) => ({
            weather: element.dataset.weather,
            phase: Number(element.dataset.weatherPhase),
          }),
        ),
        skySignatures: Array.from(doc.querySelectorAll("canvas")).map(
          (element) => {
            const pixels = element
              .getContext("2d")
              .getImageData(
                0,
                0,
                element.width,
                Math.min(80, element.height),
              ).data;
            let hash = 2166136261;
            for (const value of pixels)
              hash = Math.imul(hash ^ value, 16777619) >>> 0;
            return hash.toString(16);
          },
        ),
      },
      null,
      2,
    );
  }
}
document.querySelector("#lighting-time").addEventListener("change", (event) => {
  const doc = iframe.contentDocument;
  const seek = doc.querySelector("#time-slider");
  const set = Object.getOwnPropertyDescriptor(
    iframe.contentWindow.HTMLInputElement.prototype,
    "value",
  ).set;
  set.call(seek, event.target.value);
  seek.dispatchEvent(
    new iframe.contentWindow.Event("input", { bubbles: true }),
  );
  seek.dispatchEvent(
    new iframe.contentWindow.Event("change", { bubbles: true }),
  );
});
document
  .querySelector("#zoom-in")
  .addEventListener("click", () =>
    iframe.contentDocument
      .querySelector('button[aria-label="Phóng to"]')
      .click(),
  );
document.querySelector("#pan").addEventListener("click", () =>
  iframe.contentDocument.querySelector("canvas").dispatchEvent(
    new iframe.contentWindow.KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    }),
  ),
);
document.querySelector("#fit").addEventListener("click", () =>
  Array.from(iframe.contentDocument.querySelectorAll(".camera-controls button"))
    .find((button) => button.textContent === "Căn giữa")
    .click(),
);
document.querySelector("#weather").addEventListener("change", (event) => {
  const doc = iframe.contentDocument,
    select = doc.querySelector('[aria-label="Thời tiết ngoài trời"]');
  select.value = event.target.value;
  select.dispatchEvent(
    new iframe.contentWindow.Event("change", { bubbles: true }),
  );
});
document
  .querySelector("#play-weather")
  .addEventListener("click", () =>
    iframe.contentDocument.querySelector(".buttons .primary").click(),
  );
document
  .querySelector("#reduce-weather")
  .addEventListener("click", () =>
    iframe.contentDocument.querySelector(".check input").click(),
  );
document.querySelector("#profile-weather").addEventListener("click", () => {
  const view = iframe.contentWindow,
    start = view.performance.now(),
    times = [],
    startMinute = JSON.parse(
      view.document.querySelector("canvas").dataset.windowLight,
    ).minute,
    worldPassBefore = Array.from(view.document.querySelectorAll("canvas")).map(
      (c) => JSON.parse(c.dataset.monitors).worldPass,
    );
  let previous = start;
  document.querySelector("#frames").textContent = "Đang đo 10 giây…";
  const record = (now) => {
    times.push(now - previous);
    previous = now;
    if (now - start < 10000) {
      view.requestAnimationFrame(record);
      return;
    }
    const valid = times.slice(1),
      sorted = [...valid].sort((a, b) => a - b);
    document.querySelector("#frames").textContent = JSON.stringify(
      {
        durationMs: now - start,
        pixelReadbacks: !profileOnly,
        startMinute,
        endMinute: JSON.parse(
          view.document.querySelector("canvas").dataset.windowLight,
        ).minute,
        worldPassBefore,
        worldPassAfter: Array.from(
          view.document.querySelectorAll("canvas"),
        ).map((c) => JSON.parse(c.dataset.monitors).worldPass),
        samples: valid.length,
        meanMs: valid.reduce((a, b) => a + b, 0) / valid.length,
        p95Ms: sorted[Math.floor(sorted.length * 0.95)],
        maxMs: Math.max(...valid),
        framesOver33ms: valid.filter((ms) => ms > 33).length,
        gapsOver100ms: valid.filter((ms) => ms > 100),
        visibility: view.document.visibilityState,
        weather: view.document.querySelector(".scene").dataset.weather,
      },
      null,
      2,
    );
    stopPlayback();
  };
  view.requestAnimationFrame(record);
});
size.addEventListener("change", load);
scale.addEventListener("change", load);
iframe.addEventListener("load", measure);
setInterval(measure, 500);
load();

document.querySelector("#motion-speed").addEventListener("change", (event) => {
  const button = Array.from(
    iframe.contentDocument.querySelectorAll(".speed-group button"),
  ).find((element) => element.textContent === `${event.target.value}×`);
  button?.click();
});
document.querySelector("#motion-record").addEventListener("click", () => {
  const view = iframe.contentWindow,
    doc = iframe.contentDocument;
  const report = document.querySelector("#motion-report"),
    rows = [];
  const start = view.performance.now();
  report.textContent = "Đang ghi 6 giây…";
  const record = (now) => {
    const scenes = Array.from(doc.querySelectorAll(".scene"));
    const probeText = document.querySelector("#pixels").textContent;
    const probe = probeText.startsWith("{") ? JSON.parse(probeText) : null;
    rows.push({
      windowLight: scenes.map((scene) => {
        const f = JSON.parse(scene.querySelector("canvas").dataset.windowLight);
        return {
          minute: f.minute,
          paints: f.paints,
          sources: f.sources,
          firstPoint: f.patches[0]?.points[0],
        };
      }),
      monitors: probe?.monitors,
      pixelClock: probe
        ? {
            minute: probe.minute,
            label: probe.wallClock,
            signature: probe.clockRegion?.signature,
          }
        : null,
      wallClocks: scenes.map((scene) => scene.dataset.wallClock),
      canvasClocks: scenes.map(
        (scene) =>
          scene
            .querySelector("canvas")
            .getAttribute("aria-label")
            .match(/\d{2}:\d{2}/)?.[0],
      ),
      ms: now - start,
      clock: doc.querySelector('[data-testid="clock"]').textContent,
      modelMinute: Number(scenes[0].dataset.modelMinute),
      sky: scenes.map((scene) =>
        JSON.parse(scene.querySelector("canvas").dataset.skyFrame || "null"),
      ),
    });
    if (now - start < 6000) {
      view.requestAnimationFrame(record);
      return;
    }
    const moving = rows.filter(
      (row, index) =>
        index > 0 && row.sky[0]?.minute !== rows[index - 1].sky[0]?.minute,
    ).length;
    const result = {
      duration: now - start,
      samples: rows.length,
      moving,
      rows,
    };
    report.dataset.record = JSON.stringify(result);
    report.textContent = JSON.stringify(
      { duration: result.duration, samples: result.samples, moving },
      null,
      2,
    );
    stopPlayback();
  };
  view.requestAnimationFrame(record);
});

for (const [id, scenario] of [
  ["lights-a", "regular"],
  ["lights-b", "overtime"],
])
  document
    .querySelector(`#${id}`)
    .addEventListener("click", () =>
      iframe.contentDocument
        .querySelector(`[data-scenario="${scenario}"] .wall-light-switch`)
        ?.click(),
    );

// Keep the actual Canvas visible during visual checks and display-rAF smoke.
document.querySelector("#show-office").addEventListener("click", () => {
  iframe.contentDocument
    .querySelector(".comparison")
    .scrollIntoView({ block: "start" });
  document.querySelector("#stage").scrollIntoView({ block: "start" });
});
