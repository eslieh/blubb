import "@/styles/globals.css";
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-figtree",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <main className={figtree.className}>
      <Component {...pageProps} />
    </main>
  );
}
