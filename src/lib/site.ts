export const site = {
  name: "AGIKA Technologies",
  tagline: "Your Trusted IT Partner",
  phone: "0743852456",
  whatsappNumber: "254743852456",
  location: "Nairobi, Kenya",
  founded: "June 2019",
  // Social URLs are configurable — left empty until official profiles are provided.
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
};

export function waLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatKes(value: number) {
  return `KSh ${value.toLocaleString("en-KE")}`;
}
