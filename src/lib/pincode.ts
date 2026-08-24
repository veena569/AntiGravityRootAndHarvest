export interface PincodeInfo {
  city: string;
  state: string;
  isHyderabad: boolean;
}

// Fallback lookup table based on first 2-3 digits of Indian PIN codes
const PIN_PREFIX_MAP: Record<string, { city?: string; state: string; isHyd?: boolean }> = {
  // Telangana / Hyderabad
  "500": { city: "Hyderabad", state: "Telangana", isHyd: true },
  "501": { city: "Ranga Reddy", state: "Telangana", isHyd: true },
  "502": { city: "Medak", state: "Telangana" },
  "503": { city: "Nizamabad", state: "Telangana" },
  "504": { city: "Adilabad", state: "Telangana" },
  "505": { city: "Karimnagar", state: "Telangana" },
  "506": { city: "Warangal", state: "Telangana" },
  "507": { city: "Khammam", state: "Telangana" },
  "508": { city: "Nalgonda", state: "Telangana" },
  "509": { city: "Mahabubnagar", state: "Telangana" },

  // Andhra Pradesh
  "515": { city: "Anantapur", state: "Andhra Pradesh" },
  "516": { city: "Kadapa", state: "Andhra Pradesh" },
  "517": { city: "Tirupati", state: "Andhra Pradesh" },
  "518": { city: "Kurnool", state: "Andhra Pradesh" },
  "520": { city: "Vijayawada", state: "Andhra Pradesh" },
  "521": { city: "Krishna", state: "Andhra Pradesh" },
  "522": { city: "Guntur", state: "Andhra Pradesh" },
  "523": { city: "Ongole", state: "Andhra Pradesh" },
  "524": { city: "Nellore", state: "Andhra Pradesh" },
  "530": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "531": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "532": { city: "Srikakulam", state: "Andhra Pradesh" },
  "533": { city: "Kakinada", state: "Andhra Pradesh" },
  "534": { city: "Eluru", state: "Andhra Pradesh" },
  "535": { city: "Vizianagaram", state: "Andhra Pradesh" },

  // Tamil Nadu
  "600": { city: "Chennai", state: "Tamil Nadu" },
  "601": { city: "Tiruvallur", state: "Tamil Nadu" },
  "602": { city: "Kanchipuram", state: "Tamil Nadu" },
  "603": { city: "Chengalpattu", state: "Tamil Nadu" },
  "604": { city: "Villupuram", state: "Tamil Nadu" },
  "605": { city: "Puducherry / Cuddalore", state: "Tamil Nadu" },
  "606": { city: "Kallakurichi", state: "Tamil Nadu" },
  "607": { city: "Cuddalore", state: "Tamil Nadu" },
  "608": { city: "Chidambaram", state: "Tamil Nadu" },
  "625": { city: "Madurai", state: "Tamil Nadu" },
  "641": { city: "Coimbatore", state: "Tamil Nadu" },
  "636": { city: "Salem", state: "Tamil Nadu" },
  "620": { city: "Tiruchirappalli", state: "Tamil Nadu" },

  // Karnataka
  "560": { city: "Bengaluru", state: "Karnataka" },
  "561": { city: "Bengaluru Rural", state: "Karnataka" },
  "562": { city: "Ramanagara", state: "Karnataka" },
  "563": { city: "Kolar", state: "Karnataka" },
  "570": { city: "Mysuru", state: "Karnataka" },
  "575": { city: "Mangaluru", state: "Karnataka" },
  "580": { city: "Hubballi / Dharwad", state: "Karnataka" },
  "590": { city: "Belagavi", state: "Karnataka" },

  // Maharashtra
  "400": { city: "Mumbai", state: "Maharashtra" },
  "401": { city: "Thane", state: "Maharashtra" },
  "411": { city: "Pune", state: "Maharashtra" },
  "412": { city: "Pune Rural", state: "Maharashtra" },
  "416": { city: "Kolhapur", state: "Maharashtra" },
  "422": { city: "Nashik", state: "Maharashtra" },
  "431": { city: "Chhatrapati Sambhajinagar", state: "Maharashtra" },
  "440": { city: "Nagpur", state: "Maharashtra" },

  // Delhi & NCR
  "110": { city: "New Delhi", state: "Delhi" },
  "122": { city: "Gurugram", state: "Haryana" },
  "121": { city: "Faridabad", state: "Haryana" },
  "201": { city: "Noida / Ghaziabad", state: "Uttar Pradesh" },

  // West Bengal
  "700": { city: "Kolkata", state: "West Bengal" },
};

/**
 * Looks up location from a 6-digit Indian PIN Code
 */
export async function lookupPincode(pincode: string): Promise<PincodeInfo | null> {
  const cleanPin = pincode.replace(/\D/g, "");
  if (cleanPin.length !== 6) return null;

  // 1. Try India Post Public API with a fast timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Block || po.Circle || po.Name || "";
        const state = po.State || "";
        const isHyderabad =
          cleanPin.startsWith("500") ||
          cleanPin.startsWith("501") ||
          city.toLowerCase().includes("hyderabad") ||
          city.toLowerCase().includes("secunderabad");

        return {
          city,
          state,
          isHyderabad,
        };
      }
    }
  } catch (err) {
    // Fall back to local prefix map
  }

  // 2. Fallback to 3-digit prefix mapping
  const prefix3 = cleanPin.substring(0, 3);
  const prefix2 = cleanPin.substring(0, 2);

  if (PIN_PREFIX_MAP[prefix3]) {
    const match = PIN_PREFIX_MAP[prefix3];
    return {
      city: match.city || "",
      state: match.state,
      isHyderabad: Boolean(match.isHyd),
    };
  }

  // 3. Fallback to 2-digit state prefix mapping
  const stateBy2Digit: Record<string, string> = {
    "11": "Delhi",
    "12": "Haryana",
    "13": "Haryana",
    "14": "Punjab",
    "15": "Punjab",
    "16": "Chandigarh",
    "17": "Himachal Pradesh",
    "18": "Jammu & Kashmir",
    "19": "Jammu & Kashmir",
    "20": "Uttar Pradesh",
    "21": "Uttar Pradesh",
    "22": "Uttar Pradesh",
    "23": "Uttar Pradesh",
    "24": "Uttarakhand",
    "25": "Uttar Pradesh",
    "26": "Uttarakhand",
    "27": "Uttar Pradesh",
    "28": "Uttar Pradesh",
    "30": "Rajasthan",
    "31": "Rajasthan",
    "32": "Rajasthan",
    "33": "Rajasthan",
    "34": "Rajasthan",
    "36": "Gujarat",
    "37": "Gujarat",
    "38": "Gujarat",
    "39": "Gujarat",
    "40": "Maharashtra",
    "41": "Maharashtra",
    "42": "Maharashtra",
    "43": "Maharashtra",
    "44": "Maharashtra",
    "45": "Madhya Pradesh",
    "46": "Madhya Pradesh",
    "47": "Madhya Pradesh",
    "48": "Madhya Pradesh",
    "49": "Chhattisgarh",
    "50": "Telangana",
    "51": "Andhra Pradesh",
    "52": "Andhra Pradesh",
    "53": "Andhra Pradesh",
    "56": "Karnataka",
    "57": "Karnataka",
    "58": "Karnataka",
    "59": "Karnataka",
    "60": "Tamil Nadu",
    "61": "Tamil Nadu",
    "62": "Tamil Nadu",
    "63": "Tamil Nadu",
    "64": "Tamil Nadu",
    "67": "Kerala",
    "68": "Kerala",
    "69": "Kerala",
    "70": "West Bengal",
    "71": "West Bengal",
    "72": "West Bengal",
    "73": "West Bengal",
    "74": "West Bengal",
    "75": "Odisha",
    "76": "Odisha",
    "77": "Odisha",
    "78": "Assam",
    "79": "North East",
    "80": "Bihar",
    "81": "Jharkhand",
    "82": "Jharkhand",
    "83": "Jharkhand",
    "84": "Bihar",
    "85": "Bihar",
  };

  if (stateBy2Digit[prefix2]) {
    const isHyderabad = cleanPin.startsWith("500") || cleanPin.startsWith("501");
    return {
      city: isHyderabad ? "Hyderabad" : "",
      state: stateBy2Digit[prefix2],
      isHyderabad,
    };
  }

  return null;
}

/**
 * Calculates shipping fee and label based on PIN code, city, and cart subtotal
 */
export function calculateShippingFee(pincode: string | undefined, city: string | undefined, subtotal: number) {
  const cleanPin = (pincode || "").replace(/\D/g, "");
  const cityName = (city || "").toLowerCase();

  const isHyderabad =
    cleanPin.startsWith("500") ||
    cleanPin.startsWith("501") ||
    cityName.includes("hyderabad") ||
    cityName.includes("secunderabad");

  if (isHyderabad) {
    return {
      shippingCharge: 0,
      isHyderabad: true,
      shippingLabel: "Free Delivery (Hyderabad)",
      description: "Local Farm Delivery",
    };
  }

  // Outside Hyderabad
  if (subtotal >= 999) {
    return {
      shippingCharge: 0,
      isHyderabad: false,
      shippingLabel: "Free Delivery (Order > ₹999)",
      description: "Standard National Delivery",
    };
  }

  return {
    shippingCharge: 100,
    isHyderabad: false,
    shippingLabel: "₹100 (Standard Delivery)",
    description: "Standard National Delivery across India",
  };
}
