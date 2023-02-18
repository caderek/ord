import type { FileData } from "./types.js";

async function ModelPreview({ url, mime, ext, size }: FileData) {
  await import("@google/model-viewer");
  const model = document.createElement("model-viewer");
  model.src = url;
  model.autoRotate = true;
  model.touchAction = "pan-y";
  model.cameraControls = true;
  model.shadowIntensity = 1;
  return { el: model, mime, url, ext, size };
}

export default ModelPreview;
