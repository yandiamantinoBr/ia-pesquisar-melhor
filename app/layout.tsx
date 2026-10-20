import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA para pesquisar melhor · Yan Diamantino",
  description: "Aula interativa para a graduação em Administração. Fontes, ferramentas e uso ético da inteligência artificial.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
