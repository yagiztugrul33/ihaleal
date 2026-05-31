import { Contact } from "@/sections/Contact";

/**
 * Kurumsal URL için iletişim — anasayfadaki bölümün aynısı. h1 burada,
 * Contact section h2 "Bize Ulaşın" alt başlık kalır (anasayfada da yer
 * aldığında çakışma olmaz; Contact stand-alone değil).
 */
export default function Iletisim() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
        <h1 className="sr-only">İletişim · ihaleal.com</h1>
      </div>
      <Contact />
    </div>
  );
}
