import apiClient from "./client";

const resolveBaseUrl = () => {
  const base = apiClient.defaults.baseURL || "";

  if (!base) return "";

  // Remove "/api" from end safely
  return base.replace(/\/api\/?$/, "");
};

export const buildMediaUrl = (relativePath) => {
  if (!relativePath) return "";

  // If already full URL
  if (relativePath.startsWith("http")) {
    return relativePath;
  }

  const base = resolveBaseUrl();

  // Ensure proper slash joining
  return `${base}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
};