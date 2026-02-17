// Malunggay Knowledge Base
export function getRelevantKnowledge(query: string): string {
  const lowerQuery = query.toLowerCase();
  let knowledge = '';

  // Planting & Growing
  if (lowerQuery.match(/plant|grow|tanim|cutting|seed/)) {
    knowledge += `
PLANTING MALUNGGAY:
- From cuttings: 12-18 inch branch, plant at 45° angle, 6 inches deep
- Water daily first week, then every 2-3 days
- New roots in 7-14 days, shoots in 2-3 weeks
- Best time: Start of rainy season (May-June)
- Soil: Well-draining, pH 6.3-7.0
`;
  }

  // Harvesting
  if (lowerQuery.match(/harvest|ani|pick|kuha/)) {
    knowledge += `
HARVESTING:
- Best time: Early morning (6-8 AM)
- When plant is 1.5-2 meters tall
- Every 2-4 weeks once established
- Never harvest more than 30% at once
- Use clean scissors, cut whole branches
`;
  }

  // Diseases & Problems
  if (lowerQuery.match(/disease|yellow|problem|sakit/)) {
    knowledge += `
COMMON PROBLEMS:
- Yellow leaves: Usually overwatering or nitrogen deficiency
- Leaf spot: Brown/black spots, treat with neem oil
- Root rot: Caused by overwatering, improve drainage
- Aphids: Spray with water or neem oil
`;
  }

  // Nutrition
  if (lowerQuery.match(/nutrition|vitamin|benefit/)) {
    knowledge += `
NUTRITION (per 100g fresh leaves):
- Vitamin A: 6,780 μg
- Vitamin C: 51.7 mg
- Iron: 4.0 mg
- Protein: 9.4 g
- Calcium: 185 mg
Benefits: Boosts immunity, prevents anemia, increases breast milk
`;
  }

  // Market Prices
  if (lowerQuery.match(/price|sell|presyo|market/)) {
    knowledge += `
MARKET PRICES:
- Fresh leaves: ₱50-80 per bundle
- Dried powder: ₱120-200 per 100g
- Capsules: ₱250-400 per 60 pcs
- Organic premium: +30-50% higher
`;
  }

  return knowledge || 'General malunggay cultivation information available.';
}