import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ouf.",
    short_name: "ouf.",
    lang: "de",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f8f5",
    theme_color: "#f8f8f5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
