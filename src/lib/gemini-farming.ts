export interface PlanParams {
  crop: string;
  farmSize: number;
  location: string;
  soilType: string;
  season: string;
}

export interface TimelineActivity {
  week: number;
  phase: string;
  description: string;
  details: string[];
  startDate: string;
  endDate: string;
  icon: string;
}

export interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  texture: string;
  recommendations: string[];
}

export interface WeatherDay {
  day: string;
  temp: number;
  humidity: number;
  rainProb: number;
  condition: string;
  advisory: string;
}

export interface FarmingPlan {
  crop: string;
  location: string;
  season: string;
  timeline: TimelineActivity[];
  soil: SoilData;
  weather: WeatherDay[];
  summary: string;
}

const CROP_TIMELINES: Record<string, TimelineActivity[]> = {
  Cassava: [
    {
      week: 1,
      phase: "Land Preparation",
      description: "Clear and till the land, prepare ridges or mounds",
      details: ["Clear vegetation and stubble", "Plow to 25-30cm depth", "Form ridges 1m apart", "Apply basal manure"],
      startDate: "Week 1",
      endDate: "Week 2",
      icon: "Tractor",
    },
    {
      week: 3,
      phase: "Planting",
      description: "Plant cassava stem cuttings at correct spacing",
      details: ["Select healthy 20-30cm stems", "Plant at 45-degree angle", "Space 1m x 1m apart", "Cover lightly with soil"],
      startDate: "Week 3",
      endDate: "Week 4",
      icon: "Sprout",
    },
    {
      week: 5,
      phase: "First Weeding",
      description: "Remove competing weeds while young",
      details: ["Hand-weed carefully around plants", "Avoid disturbing roots", "Apply mulch where available"],
      startDate: "Week 5",
      endDate: "Week 6",
      icon: "Scissors",
    },
    {
      week: 8,
      phase: "Fertilizer Application",
      description: "Apply NPK fertilizer for vigorous growth",
      details: ["Apply 400kg/ha NPK 15-15-15", "Place fertilizer 10cm from stems", "Cover and water lightly"],
      startDate: "Week 8",
      endDate: "Week 9",
      icon: "FlaskConical",
    },
    {
      week: 12,
      phase: "Pest Control",
      description: "Monitor and control cassava mealybug and green mite",
      details: ["Scout for cassava mealybug", "Apply neem extract if infested", "Monitor for African cassava mosaic virus"],
      startDate: "Week 12",
      endDate: "Week 13",
      icon: "Shield",
    },
    {
      week: 16,
      phase: "Second Weeding",
      description: "Second round of weed control",
      details: ["Remove all weeds", "Earth up around stems", "Reapply mulch if available"],
      startDate: "Week 16",
      endDate: "Week 17",
      icon: "Scissors",
    },
    {
      week: 24,
      phase: "Bulking Phase",
      description: "Roots begin active bulking — ensure adequate moisture",
      details: ["Maintain soil moisture", "Monitor for nutrient deficiencies", "Apply foliar feed if needed"],
      startDate: "Week 24",
      endDate: "Week 36",
      icon: "TrendingUp",
    },
    {
      week: 48,
      phase: "Harvest",
      description: "Harvest mature cassava roots",
      details: ["Harvest when leaves turn yellow", "Use fork to lift roots carefully", "Process within 48 hours"],
      startDate: "Week 48",
      endDate: "Week 52",
      icon: "Wheat",
    },
  ],
  Maize: [
    {
      week: 1,
      phase: "Land Preparation",
      description: "Plow and harrow field to fine tilth",
      details: ["Deep plow 25-30cm", "Harrow to break clods", "Create furrows 75cm apart"],
      startDate: "Week 1",
      endDate: "Week 1",
      icon: "Tractor",
    },
    {
      week: 2,
      phase: "Planting",
      description: "Sow maize seeds at recommended spacing",
      details: ["Plant 2 seeds per hole", "Space 25cm between plants", "Plant 5cm deep", "Apply starter fertilizer"],
      startDate: "Week 2",
      endDate: "Week 3",
      icon: "Sprout",
    },
    {
      week: 4,
      phase: "Thinning & Weeding",
      description: "Thin to one plant per stand and weed",
      details: ["Thin to strongest seedling", "Weed entire field", "First NPK top-dressing"],
      startDate: "Week 4",
      endDate: "Week 5",
      icon: "Scissors",
    },
    {
      week: 6,
      phase: "Top Dressing",
      description: "Apply urea at knee-high stage",
      details: ["Apply urea 200kg/ha", "Place between rows, cover with soil", "Ensure adequate moisture"],
      startDate: "Week 6",
      endDate: "Week 7",
      icon: "FlaskConical",
    },
    {
      week: 8,
      phase: "Pest Control",
      description: "Control stem borers and army worms",
      details: ["Scout for fall armyworm", "Apply biopesticides or approved insecticides", "Monitor for stalk borers"],
      startDate: "Week 8",
      endDate: "Week 10",
      icon: "Shield",
    },
    {
      week: 12,
      phase: "Tasseling & Silking",
      description: "Critical pollination period — monitor water needs",
      details: ["Ensure adequate soil moisture", "Watch for silk cutting insects", "Supplement irrigation if needed"],
      startDate: "Week 12",
      endDate: "Week 14",
      icon: "Flower2",
    },
    {
      week: 16,
      phase: "Grain Filling",
      description: "Kernels develop — protect from birds and pests",
      details: ["Bird scaring measures", "Monitor for cob borers", "Avoid water stress"],
      startDate: "Week 16",
      endDate: "Week 18",
      icon: "TrendingUp",
    },
    {
      week: 20,
      phase: "Harvest",
      description: "Harvest when husks dry and kernels hard",
      details: ["Harvest at 20% moisture", "De-husk and dry immediately", "Store at 13% moisture"],
      startDate: "Week 20",
      endDate: "Week 22",
      icon: "Wheat",
    },
  ],
  Rice: [
    {
      week: 1, phase: "Nursery Preparation", description: "Prepare raised nursery beds", details: ["Select well-drained area", "Prepare 1m wide beds", "Apply compost and level"], startDate: "Week 1", endDate: "Week 1", icon: "Tractor",
    },
    {
      week: 2, phase: "Sowing", description: "Pre-germinate and sow seeds in nursery", details: ["Soak seeds 24 hours", "Incubate till sprouting", "Broadcast 50kg/ha on nursery"], startDate: "Week 2", endDate: "Week 2", icon: "Sprout",
    },
    {
      week: 4, phase: "Main Field Prep", description: "Puddle field for transplanting", details: ["Plow and puddle field", "Level thoroughly", "Maintain 5cm water"], startDate: "Week 4", endDate: "Week 5", icon: "Tractor",
    },
    {
      week: 6, phase: "Transplanting", description: "Transplant 21-day old seedlings", details: ["Transplant 2-3 seedlings/hill", "Space 20cm x 20cm", "Plant 3-4cm deep"], startDate: "Week 6", endDate: "Week 7", icon: "Sprout",
    },
    {
      week: 8, phase: "Weeding & Fertilizer", description: "Weed and apply NPK", details: ["Hand-weed or use rotary", "Apply NPK 200kg/ha", "Top-dress with urea at tillering"], startDate: "Week 8", endDate: "Week 9", icon: "FlaskConical",
    },
    {
      week: 12, phase: "Pest Management", description: "Control stem borer and blast", details: ["Monitor for stem borer", "Watch for blast disease", "Apply fungicide if needed"], startDate: "Week 12", endDate: "Week 14", icon: "Shield",
    },
    {
      week: 16, phase: "Flowering", description: "Panicle initiation — critical water stage", details: ["Maintain water at 5cm", "Drain and re-apply", "Monitor for diseases"], startDate: "Week 16", endDate: "Week 18", icon: "Flower2",
    },
    {
      week: 20, phase: "Harvest", description: "Harvest when grains are golden", details: ["Drain field 10 days before", "Harvest at 20-22% moisture", "Thresh and dry immediately"], startDate: "Week 20", endDate: "Week 22", icon: "Wheat",
    },
  ],
  Yam: [
    {
      week: 1, phase: "Land Preparation", description: "Prepare mounds or ridges for yam", details: ["Select loose, well-drained soil", "Form mounds 1m apart", "Incorporate organic matter"], startDate: "Week 1", endDate: "Week 2", icon: "Tractor",
    },
    {
      week: 3, phase: "Planting", description: "Plant whole seed yams or setts", details: ["Use certified seed yams", "Plant 10cm deep on mounds", "Space 1m x 1m"], startDate: "Week 3", endDate: "Week 4", icon: "Sprout",
    },
    {
      week: 6, phase: "Staking", description: "Provide supports for vines to climb", details: ["Erect 2m stakes beside plants", "Train vines upward", "Use strong bamboo or wood"], startDate: "Week 6", endDate: "Week 8", icon: "ArrowUp",
    },
    {
      week: 8, phase: "First Weeding", description: "Weed and apply fertilizer", details: ["Hand-weed carefully", "Apply NPK 15-15-15", "Mulch around plants"], startDate: "Week 8", endDate: "Week 10", icon: "Scissors",
    },
    {
      week: 14, phase: "Pest Control", description: "Control yam beetles and nematodes", details: ["Monitor for yam beetle", "Apply neem cake for nematodes", "Remove and destroy infected plants"], startDate: "Week 14", endDate: "Week 16", icon: "Shield",
    },
    {
      week: 24, phase: "Tuber Bulking", description: "Critical growth phase for tubers", details: ["Ensure consistent moisture", "Apply potassium fertilizer", "Maintain mulch cover"], startDate: "Week 24", endDate: "Week 32", icon: "TrendingUp",
    },
    {
      week: 36, phase: "Maturation", description: "Vines yellow and dry — tubers mature", details: ["Reduce watering", "Cut back vines", "Prepare for harvest"], startDate: "Week 36", endDate: "Week 40", icon: "Timer",
    },
    {
      week: 44, phase: "Harvest", description: "Carefully harvest mature yam tubers", details: ["Dig carefully around tubers", "Lift gently to avoid bruising", "Cure in shade for 3-4 days"], startDate: "Week 44", endDate: "Week 48", icon: "Wheat",
    },
  ],
  Tomato: [
    {
      week: 1, phase: "Nursery", description: "Sow tomato seeds in nursery beds", details: ["Prepare fine seedbed", "Sow seeds in rows", "Cover lightly and water"], startDate: "Week 1", endDate: "Week 2", icon: "Sprout",
    },
    {
      week: 4, phase: "Transplanting", description: "Transplant seedlings to field", details: ["Harden off seedlings", "Space 60cm x 45cm", "Water immediately after"], startDate: "Week 4", endDate: "Week 5", icon: "Sprout",
    },
    {
      week: 6, phase: "Staking & Pruning", description: "Support plants and remove suckers", details: ["Stake indeterminate varieties", "Remove lateral suckers", "Tie stems to stakes"], startDate: "Week 6", endDate: "Week 8", icon: "ArrowUp",
    },
    {
      week: 8, phase: "Flowering & Fertilizer", description: "Apply fertilizer at flowering", details: ["Apply NPK + calcium", "Maintain consistent moisture", "Avoid wetting foliage"], startDate: "Week 8", endDate: "Week 10", icon: "FlaskConical",
    },
    {
      week: 10, phase: "Fruit Set", description: "Monitor fruit development", details: ["Ensure pollination", "Monitor for blossom end rot", "Apply calcium if needed"], startDate: "Week 10", endDate: "Week 12", icon: "Flower2",
    },
    {
      week: 12, phase: "Pest/Disease Control", description: "Control Tuta absoluta and late blight", details: ["Scout for Tuta absoluta", "Apply biopesticides", "Remove infected leaves"], startDate: "Week 12", endDate: "Week 14", icon: "Shield",
    },
    {
      week: 14, phase: "Harvesting", description: "Pick ripe tomatoes", details: ["Harvest at breaker stage", "Pick every 2-3 days", "Handle carefully to avoid bruising"], startDate: "Week 14", endDate: "Week 20", icon: "Wheat",
    },
  ],
  Cocoa: [
    {
      week: 1, phase: "Site Selection", description: "Choose suitable location with shade", details: ["Select well-drained soil", "Plan for shade trees", "Test soil pH (5.5-6.5)"], startDate: "Month 1", endDate: "Month 1", icon: "MapPin",
    },
    {
      week: 4, phase: "Planting", description: "Plant cocoa seedlings or cuttings", details: ["Use improved varieties", "Plant 3m x 3m spacing", "Provide temporary shade"], startDate: "Month 2", endDate: "Month 3", icon: "Sprout",
    },
    {
      week: 24, phase: "Establishment Care", description: "Care for young seedlings", details: ["Water during dry spells", "Weed regularly", "Apply mulch"], startDate: "Month 6", endDate: "Month 12", icon: "Heart",
    },
    {
      week: 52, phase: "First Pruning", description: "Shape young cocoa tree", details: ["Remove low branches", "Select 3-5 main branches", "Clear chupons"], startDate: "Year 2", endDate: "Year 2", icon: "Scissors",
    },
    {
      week: 104, phase: "First Flowering", description: "Trees begin flowering", details: ["Monitor water needs", "Apply NPK fertilizer", "Control capsids early"], startDate: "Year 3", endDate: "Year 3", icon: "Flower2",
    },
    {
      week: 156, phase: "Harvest", description: "Harvest ripe cocoa pods", details: ["Harvest pods every 2 weeks", "Split pods same day", "Ferment beans 5-7 days"], startDate: "Year 4+", endDate: "Ongoing", icon: "Wheat",
    },
  ],
  Groundnut: [
    {
      week: 1, phase: "Land Preparation", description: "Prepare loose, well-drained seedbed", details: ["Plow to 15-20cm", "Harrow to fine tilth", "Ensure good drainage"], startDate: "Week 1", endDate: "Week 1", icon: "Tractor",
    },
    {
      week: 2, phase: "Sowing", description: "Sow groundnut seeds at correct depth", details: ["Shell pods carefully", "Plant 5cm deep", "Space 20cm x 75cm", "Inoculate with rhizobium"], startDate: "Week 2", endDate: "Week 3", icon: "Sprout",
    },
    {
      week: 4, phase: "Weeding", description: "First critical weeding at pegging stage", details: ["Hand-weed carefully", "Avoid disturbing pegs", "Apply calcium if needed"], startDate: "Week 4", endDate: "Week 5", icon: "Scissors",
    },
    {
      week: 6, phase: "Flowering & Pegging", description: "Monitor flower and peg development", details: ["Ensure calcium availability", "Maintain moisture", "Watch for rosette disease"], startDate: "Week 6", endDate: "Week 8", icon: "Flower2",
    },
    {
      week: 10, phase: "Pod Formation", description: "Pods develop underground", details: ["Avoid waterlogging", "Light irrigation if dry", "Monitor for aphids"], startDate: "Week 10", endDate: "Week 14", icon: "TrendingUp",
    },
    {
      week: 16, phase: "Harvest", description: "Harvest when leaves yellow", details: ["Loosen soil with fork", "Pull plants carefully", "Dry pods to 8-10% moisture"], startDate: "Week 16", endDate: "Week 18", icon: "Wheat",
    },
  ],
  Sorghum: [
    {
      week: 1, phase: "Land Preparation", description: "Prepare fine seedbed", details: ["Plow and harrow", "Create furrows 75cm apart", "Incorporate manure"], startDate: "Week 1", endDate: "Week 1", icon: "Tractor",
    },
    {
      week: 2, phase: "Sowing", description: "Sow sorghum seeds", details: ["Plant 3-4cm deep", "Space 15cm between plants", "Thin to 2 plants/stand"], startDate: "Week 2", endDate: "Week 3", icon: "Sprout",
    },
    {
      week: 4, phase: "Thinning & Weeding", description: "Thin and remove weeds", details: ["Thin to desired spacing", "Hand-weed field", "First top-dressing"], startDate: "Week 4", endDate: "Week 5", icon: "Scissors",
    },
    {
      week: 6, phase: "Fertilizer", description: "Apply urea top-dressing", details: ["Apply urea at knee-high", "Place between rows", "Cover with soil"], startDate: "Week 6", endDate: "Week 7", icon: "FlaskConical",
    },
    {
      week: 8, phase: "Pest Control", description: "Control shoot fly and stem borer", details: ["Monitor for shoot fly", "Apply recommended insecticide", "Remove dead hearts"], startDate: "Week 8", endDate: "Week 10", icon: "Shield",
    },
    {
      week: 12, phase: "Heading", description: "Panicle emergence stage", details: ["Ensure adequate moisture", "Watch for grain mold", "Bird scaring measures"], startDate: "Week 12", endDate: "Week 14", icon: "Flower2",
    },
    {
      week: 16, phase: "Harvest", description: "Harvest when grains hard", details: ["Harvest at physiological maturity", "Dry to 12-13% moisture", "Thresh and clean"], startDate: "Week 16", endDate: "Week 18", icon: "Wheat",
    },
  ],
};

const SOIL_PROFILES: Record<string, SoilData> = {
  Loamy: {
    nitrogen: 65,
    phosphorus: 55,
    potassium: 70,
    ph: 6.5,
    texture: "Loamy",
    recommendations: [
      "Your loamy soil is ideal for most crops — maintain organic matter above 3%.",
      "Add compost annually to preserve structure and nutrient levels.",
      "Rotate legumes to naturally replenish nitrogen reserves.",
    ],
  },
  Sandy: {
    nitrogen: 30,
    phosphorus: 25,
    potassium: 35,
    ph: 5.8,
    texture: "Sandy",
    recommendations: [
      "Sandy soil drains quickly — add organic mulch to improve water retention.",
      "Apply fertilizer in smaller, more frequent doses to prevent leaching.",
      "Incorporate compost or well-rotted manure to boost nutrient-holding capacity.",
      "Consider drip irrigation for efficient water use.",
    ],
  },
  Clay: {
    nitrogen: 50,
    phosphorus: 60,
    potassium: 65,
    ph: 7.2,
    texture: "Clay",
    recommendations: [
      "Clay soil holds nutrients well but may have drainage issues — add sand and organic matter.",
      "Avoid working the soil when wet to prevent compaction.",
      "Plant cover crops with deep taproots to break up clay layers.",
      "Raised beds can improve drainage for sensitive crops.",
    ],
  },
  Silt: {
    nitrogen: 55,
    phosphorus: 50,
    potassium: 60,
    ph: 6.8,
    texture: "Silty",
    recommendations: [
      "Silty soil is fertile but can compact — minimize tillage.",
      "Add coarse compost to improve aeration and drainage.",
      "Use controlled traffic patterns to prevent compaction.",
      "Cover crops help maintain soil structure between seasons.",
    ],
  },
};

const WEATHER_CONDITIONS = [
  { condition: "Partly Cloudy", advisory: "Good conditions for field work — moderate sun exposure." },
  { condition: "Light Rain", advisory: "Hold off on spraying — rain will wash off treatments. Good for transplanting." },
  { condition: "Sunny", advisory: "Ensure adequate irrigation — high evaporation expected." },
  { condition: "Overcast", advisory: "Ideal for planting and fertilizing — minimal water stress on seedlings." },
  { condition: "Thunderstorm", advisory: "Avoid field work — lightning risk. Check drainage after storm passes." },
];

function generateWeather(location: string, season: string): WeatherDay[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const baseTemp = location.match(/Kaduna|Kano/) ? 34 : location.match(/Niger|Minna/) ? 31 : 29;
  const temp = season === "Dry Season" ? baseTemp + 4 : baseTemp;

  return days.map((day, i) => {
    const cond = WEATHER_CONDITIONS[(i + (location.length % 3)) % WEATHER_CONDITIONS.length];
    return {
      day,
      temp: temp + (i % 3) - 1,
      humidity: season === "Rainy Season" ? 75 + (i * 3) : 45 + (i * 4),
      rainProb: season === "Rainy Season" ? 60 + (i * 8) : 10 + (i * 5),
      condition: cond.condition,
      advisory: cond.advisory,
    };
  });
}

function buildPrompt(params: PlanParams): string {
  return `Generate a detailed farming plan for a Nigerian farmer with the following parameters:
- Crop: ${params.crop}
- Farm Size: ${params.farmSize} acres
- Location: ${params.location}
- Soil Type: ${params.soilType}
- Season: ${params.season}

Return a structured JSON response with:
1. A timeline of farming activities with phases, descriptions, and detailed instructions
2. Soil health analysis with NPK levels and recommendations
3. 5-day weather forecast with farming advisories
4. A summary of the plan

Format as valid JSON.`;
}

export async function generateFarmingPlan(params: PlanParams): Promise<FarmingPlan> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1500));
    return generateDemoPlan(params);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(params) }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        crop: params.crop,
        location: params.location,
        season: params.season,
        timeline: parsed.timeline || CROP_TIMELINES[params.crop] || CROP_TIMELINES["Maize"],
        soil: parsed.soil || SOIL_PROFILES[params.soilType] || SOIL_PROFILES["Loamy"],
        weather: parsed.weather || generateWeather(params.location, params.season),
        summary: parsed.summary || `Personalized ${params.crop} farming plan for ${params.location}.`,
      };
    }

    throw new Error("Could not parse Gemini response");
  } catch {
    return generateDemoPlan(params);
  }
}

function generateDemoPlan(params: PlanParams): FarmingPlan {
  return {
    crop: params.crop,
    location: params.location,
    season: params.season,
    timeline: CROP_TIMELINES[params.crop] || CROP_TIMELINES["Maize"],
    soil: SOIL_PROFILES[params.soilType] || SOIL_PROFILES["Loamy"],
    weather: generateWeather(params.location, params.season),
    summary: `Your personalized ${params.crop} farming plan for ${params.farmSize} acres in ${params.location} during the ${params.season}. Follow this timeline for optimal yields and soil health.`,
  };
}
