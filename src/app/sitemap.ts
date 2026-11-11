import { MetadataRoute } from "next";
import { INITIAL_DB_STATE } from "@/lib/initial-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vitalsur.com.ar";

  const productUrls = INITIAL_DB_STATE.products.map((product) => ({
    url: `${baseUrl}/productos/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/carrito`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...productUrls,
  ];
}

