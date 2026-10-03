// Categorías y preguntas del FAQ (claves de traducción bajo el namespace `faq`).
// Se comparte entre la página (contenido visible) y el layout (schema FAQPage)
// para que el JSON-LD siempre coincida con lo que ve el usuario.
export const faqCategories = [
  {
    titleKey: "categories.products",
    questions: [
      { key: "products.karat" },
      { key: "products.solid" },
      { key: "products.customize" },
      { key: "products.stones" },
      { key: "products.resize" },
    ],
  },
  {
    titleKey: "categories.purchase",
    questions: [
      { key: "purchase.payment" },
      { key: "purchase.installments" },
      { key: "purchase.secure" },
      { key: "purchase.layaway" },
      { key: "purchase.invoice" },
    ],
  },
  {
    titleKey: "categories.shipping",
    questions: [
      { key: "shipping.cost" },
      { key: "shipping.time" },
      { key: "shipping.tracking" },
      { key: "shipping.insured" },
      { key: "shipping.pickup" },
    ],
  },
  {
    titleKey: "categories.returns",
    questions: [
      { key: "returns.return" },
      { key: "returns.exchange" },
      { key: "returns.size" },
      { key: "returns.engraved" },
    ],
  },
  {
    titleKey: "categories.about",
    questions: [
      { key: "about.location" },
      { key: "about.experience" },
      { key: "about.manufacturer" },
      { key: "about.buyGold" },
      { key: "about.contact" },
    ],
  },
] as const;
