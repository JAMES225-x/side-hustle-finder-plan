export function labelDifficulty(d: string) {
  if (d === "easy") return "Madali";
  if (d === "hard") return "Mahirap";
  return "Katamtaman";
}

export function labelInternet(i: string) {
  const map: Record<string, string> = {
    data: "Mobile data",
    prepaid_wifi: "Prepaid WiFi",
    fiber: "Fiber",
    any: "Kahit hindi online",
  };
  return map[i] ?? i;
}

export function labelDevice(d: string) {
  const map: Record<string, string> = {
    phone: "Phone",
    laptop: "Laptop",
    motor: "Motor",
    car: "Kotse",
  };
  return map[d] ?? d;
}

export function labelSkill(s: string) {
  const map: Record<string, string> = {
    communication: "Communication",
    english: "English",
    sales: "Sales",
    customer_service: "Customer service",
    content: "Content creation",
    video_editing: "Video editing",
    graphic_design: "Graphic design",
    writing: "Writing",
    teaching: "Teaching",
    admin: "Admin/Organization",
    tech: "Tech",
    accounting: "Bookkeeping",
    delivery: "Delivery/Rider",
    cooking: "Cooking/Baking",
    beauty: "Beauty services",
    repair: "Repair",
    photography: "Photo/Video",
    agri: "Agri",
  };
  return map[s] ?? s.replace(/_/g, " ");
}
