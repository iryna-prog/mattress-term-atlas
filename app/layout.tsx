import type { ReactNode } from "react";
import "../src/styles.css";

export const metadata = {
  title: "Mattress Term Atlas",
  description: "A private mattress-term discovery, review, and taxonomy workspace.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
