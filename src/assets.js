// Загрузка изображений (SVG/PNG) как Image()
export async function loadAssets(paths) {
  const entries = Object.entries(paths);
  const loadOne = ([key, url]) => new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve([key, img]);
    img.onerror = () => {
      console.warn('[assets] failed', key, url);
      resolve([key, null]);
    };
    img.src = url;
  });
  const loaded = await Promise.all(entries.map(loadOne));
  return Object.fromEntries(loaded);
}