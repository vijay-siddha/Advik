const testComponents = [
  {
    component_id: "CMP-001",
    name: "Industrial Centrifugal Pump",
    parent_id: null, // Root Component
    media: {
      photos: ["https://placehold.co/400x300?text=Pump+Main"],
      videos: ["/uploads/pump_demo.mp4"],
      form_links: ["https://forms.gle/pump-inspection"]
    },
    attributes: {
      "Flow Rate": "500 m³/h",
      "Max Pressure": "15 Bar",
      "Power Source": "Electric",
      "Operating Temp": "-10°C to 120°C",
      "Material": "Stainless Steel 316"
    },
    roles: ["admin", "manager"]
  },
  {
    component_id: "SUB-101",
    name: "Heavy Duty Impeller",
    parent_id: "CMP-001", // Child of Pump
    media: {
      photos: ["https://placehold.co/400x300?text=Impeller"],
      videos: [],
      form_links: []
    },
    attributes: {
      "Diameter": "250mm",
      "Vane Count": 6,
      "Balancing Grade": "G2.5",
      "Coating": "Ceramic"
    },
    roles: ["admin", "manager"]
  },
  {
    component_id: "CMP-002",
    name: "High-Pressure Diesel Generator",
    parent_id: null, // Root Component (for comparison)
    media: {
      photos: ["https://placehold.co/400x300?text=Generator"],
      videos: ["/uploads/gen_startup.mp4"],
      form_links: []
    },
    attributes: {
      "Power Output": "250 kVA",
      "Fuel Consumption": "45 L/h",
      "Max Pressure": "10 Bar", // Shared field with Pump
      "Noise Level": "75 dB",
      "Cooling System": "Water Cooled"
    },
    roles: ["admin", "manager"]
  },
  {
    component_id: "SUB-102",
    name: "Fuel Injection Nozzle",
    parent_id: "CMP-002", // Child of Generator
    media: {
      photos: ["https://placehold.co/400x300?text=Nozzle"],
      videos: [],
      form_links: []
    },
    attributes: {
      "Spray Angle": "120°",
      "Opening Pressure": "250 Bar",
      "Material": "Tungsten Carbide"
    },
    roles: ["admin"]
  }
];