import type { Metadata } from "next";
import "./globals.css";
import { VitalSurProvider } from "@/context/VitalSurContext";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ToastNotification } from "@/components/store/ToastNotification";

export const metadata: Metadata = {
  title: {
    default: "Vital Sur | Suplementos Deportivos y Bienestar en Florencio Varela",
    template: "%s | Vital Sur Suplementos",
  },
  description:
    "Tienda de suplementos deportivos, proteínas, creatinas, aminoácidos y vitaminas en Florencio Varela, Zona Sur de Buenos Aires. Envíos a todo el país por Correo Argentino.",
  keywords: [
    "suplementos deportivos",
    "Florencio Varela",
    "Zona Sur",
    "proteína whey",
    "creatina monohidratada",
    "magnesio quelado",
    "Vital Sur",
    "envíos Correo Argentino",
  ],
  openGraph: {
    title: "Vital Sur | Suplementos Deportivos y Bienestar - Florencio Varela",
    description:
      "Nutrición honesta y suplementos originales desde Zona Sur a toda la Argentina. Envío gratis superando los $80.000.",
    type: "website",
    locale: "es_AR",
    siteName: "Vital Sur",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="font-sans antialiased bg-brand-white text-brand-ink selection:bg-brand-green-soft selection:text-brand-green-dark">
        <VitalSurProvider>
          {children}
          <CartDrawer />
          <ToastNotification />
        </VitalSurProvider>
      </body>
    </html>
  );
}
