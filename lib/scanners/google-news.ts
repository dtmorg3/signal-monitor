import { fetchAndParseFeed, type FeedItem } from './rss-parser'
import type { DetectedSignal } from './hacker-news'
import type { SignalType } from '../types'

function buildGoogleNewsUrl(query: string): string {
  const encodedQuery = encodeURIComponent(query)
  return `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`
}

function classifyFromTitle(item: FeedItem): { type: SignalType; score: number; play: string } {
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Funding/financial signals
  if (text.includes('raises') || text.includes('funding') || text.includes('series') || 
      text.includes('investment') || text.includes('ipo') || text.includes('valuation') ||
      text.includes('$') && (text.includes('million') || text.includes('billion'))) {
    return {
      type: 'funding',
      score: 82,
      play: 'Funding news detected - ideal time to discuss growth plans and how you can support their scaled operations.'
    }
  }

  // Product/launch signals
  if (text.includes('launch') || text.includes('release') || text.includes('announce') ||
      text.includes('introduce mode') || text.includes('unveil') || text.includes('new feature')) {
    return {
      type: 'product_launch',
      score: 73,
      play: 'Product news - reach out to discuss integration opportunities or how you can enhance their new offering.'
    }
  }

  // Hiring/growth signals
  if (text.includes('hiring') || text.includes('jobs') || text.includes('workforce') ||
      text.includes('employees') || text.includes('headcount') || text.includes('recruiting')) {
    return {
      type: 'hiring',
      score: 70,
      play: 'Hiring activity indicates growth - discuss how your solution scales with their expanding team.'
    }
  }

  // Partnership signals
  if (text.includes('partner') || text.includes('deal') || text.includes('agreement') ||
      text.includes('collaboration') || text.includes('alliance') || text.includes('acquisition')) {
    return {
      type: 'partnership',
      score: 68,
      play: 'Partnership or deal news - explore synergies and how you fit into their evolving strategy.'
    }
  }

  // Expansion signals
  if (text.includes('expand') || text.includes('growth') || text.includes('opens') ||
      text.includes('new office') || text.includes('new market') || text.includes('international')) {
    return {
      type: 'expansion',
      score: 65,
      play: 'Expansion news - discuss how you can support their growth into new markets or segments.'
    }
  }

  // Tech adoption signals
  if (text.includes('ai') || text.includes('cloud') || text.includes('digital') ||
      text.includes('automation') || text.includes('platform') || text.includes('technology')) {
    return {
      type: 'tech_adoption',
      score: 60,
      play: 'Technology initiative mentioned - explore alignment with their tech strategy.'
    }
  }

  // Default press mention
  return {
    type: 'press_mention',
    score: 50,
    play: 'Recent press coverage - use as a touchpoint to stay top of mind.'
  }
}

export async function scanGoogleNews(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []

  // Search for company name
  const searchQuery = `"${companyName}"`

  try {
    const feedUrl = buildGoogleNewsUrl(searchQuery)
    const feed = await fetchAndParseFeed(feedUrl)

    // Take top 10 results to avoid noise
    const relevantItems = feed.items.slice(0, 10)

    for (const item of relevantItems) {
      const { type, score, play } = classifyFromTitle(item)

      // Extract actual source from Google News title format: "Title - Source"
      const titleParts = item.title.split(' - ')
      const source = titleParts.length > 1 ? titleParts.pop() : null
      const cleanTitle = titleParts.join(' - ')

      signals.push({
        source: 'google_news',
        type,
        title: cleanTitle,
        snippet: item.description.substring(0, 300),
        url: item.link,
        score,
        play_recommendation: play,
        raw_data: {
          originalSource: source,
          pubDate: item.pubDate?.toISOString(),
          query: searchQuery
        }
      })
    }
  } catch (error) {
    console.error('Google News scan error:', error)
  }

  return signals
}
