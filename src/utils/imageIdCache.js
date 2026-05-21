const KEY = "gb_img_ids";

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
};

export const cacheImageId = (url, id) => {
  if (!url || !id) return;
  const cache = load();
  cache[url] = id;
  localStorage.setItem(KEY, JSON.stringify(cache));
};

export const getCachedImageId = (url) => {
  if (!url) return null;
  return load()[url] ?? null;
};
