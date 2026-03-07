import type { DetectedSignal } from './hacker-news'

// This scanner generates contextual signals based on company info
// In production, this would integrate with a real search API (Google, Bing, etc.)

export async function scanWebSearch(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []

  // Simulate web search results based on common patterns
  // In production, replace with actual search API calls
  
  const searchPatterns = [
    {
      type: 'expansion' as const,
      keywords: ['expansion', 'new office', 'opens', 'expands to'],
      titleTemplate: `${companyName} announces expansion plans`,
      snippetTemplate: `${companyName} is expanding operations with new regional presence...`,
      recommendation: 'Geographic expansion signals growth. Offer support for the new region.'
    },
    {
      type: 'partnership' as const,
      keywords: ['partnership', 'partners with', 'collaboration', 'announces deal'],
      titleTemplate: `${companyName} forms strategic partnership`,
      snippetTemplate: `${companyName} announced a new partnership to enhance their offerings...`,
      recommendation: 'Partnerships indicate strategic focus areas. Position as complementary solution.'
    },
    {
      type: 'leadership_change' as const,
      keywords: ['new ceo', 'new cto', 'appoints', 'joins as'],
      titleTemplate: `${companyName} welcomes new executive leadership`,
      snippetTemplate: `${companyName} has appointed new leadership to drive the next phase of growth...`,
      recommendation: 'New leadership brings new priorities. Request intro meeting to align on vision.'
    },
    {
      type: 'funding' as const,
      keywords: ['raises', 'funding round', 'series', 'investment'],
      titleTemplate: `${companyName} secures new funding`,
      snippetTemplate: `${companyName} has raised capital to accelerate growth and product development...`,
      recommendation: 'Fresh funding means budget for new tools. Schedule executive briefing.'
    },
    {
      type: 'product_launch' as const,
      keywords: ['launches', 'introduces', 'unveils', 'announces new'],
      titleTemplate: `${companyName} launches new offering`,
      snippetTemplate: `${companyName} unveiled their latest solution targeting enterprise customers...`,
      recommendation: 'New products need supporting infrastructure. Discuss integration opportunities.'
    }
  ]

  // Randomly select 1-2 signals to simulate search results
  const shuffled = searchPatterns.sort(() => Math.random() - 0.5)
  const selectedCount = Math.floor(Math.random() * 2) + 1

  for (let i = 0; i < selectedCount && i < shuffled.length; i++) {
    const pattern = shuffled[i]
    
    // Generate a score between 50-85 for web search results
    const score = Math.floor(Math.random() * 35) + 50

    signals.push({
      source: 'web_search',
      type: pattern.type,
      title: pattern.titleTemplate,
      snippet: pattern.snippetTemplate,
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' ' + pattern.keywords[0])}`,
      score,
      play_recommendation: pattern.recommendation
    })
  }

  return signals
}
