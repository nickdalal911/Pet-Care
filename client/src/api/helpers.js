import apiClient from "./client";

const resolveBaseUrl = () => {
  const base = apiClient.defaults.baseURL || "";
  if (!base) {
    return "";
  }
  return base.replace(/\/api\/?$/, "");
};

export const buildMediaUrl = (relativePath) => {
  if (!relativePath) {
    return "";
  }
  if (relativePath.startsWith("http")) {
    return relativePath;
  }
  return `${resolveBaseUrl()}${relativePath}`;
};
