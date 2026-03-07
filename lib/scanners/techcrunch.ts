import { fetchAndParseFeed, type FeedItem } from './rss-parser'
import type { DetectedSignal } from './hacker-news'
import type { SignalType } from '../types'

const TECHCRUNCH_FEED_URL = 'https://techcrunch.com/feed/'

function classifySignal(item: FeedItem): { type: SignalType; score: number; play: string } {
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Funding signals
  if (text.includes('raises') || text.includes('funding') || text.includes('series') || 
      text.includes('million') || text.includes('investment') || text.includes('valuation')) {
    return {
      type: 'funding',
      score: 85,
      play: 'Funding announcement - reach out to congratulate and discuss how additional resources could accelerate their initiatives.'
    }
  }

  // Product launch signals
  if (text.includes('launch') || text.includes('announces') || text.includes('introduces') ||
      text.includes('releases') || text.includes('unveils') || text.includes('new product')) {
    return {
      type: 'product_launch',
      score: 75,
      play: 'New product/feature launch - opportunity to discuss how your solution integrates with their expanding product line.'
    }
  }

  // Partnership signals
  if (text.includes('partner') || text.includes('collaboration') || text.includes('integration') ||
      text.includes('teams up') || text.includes('joins forces')) {
    return {
      type: 'partnership',
      score: 70,
      play: 'Partnership announcement - explore how your offering could complement their expanding ecosystem.'
    }
  }

  // Expansion signals
  if (text.includes('expands') || text.includes('expansion') || text.includes('opens') ||
      text.includes('new market') || text.includes('international') || text.includes('global')) {
    return {
      type: 'expansion',
      score: 72,
      play: 'Geographic or market expansion - discuss scaling challenges and how you can support their growth.'
    }
  }

  // Leadership changes
  if (text.includes('ceo') || text.includes('cto') || text.includes('cfo') || 
      text.includes('appoints') || text.includes('hires') || text.includes('joins as')) {
    return {
      type: 'leadership_change',
      score: 68,
      play: 'Leadership change - new executives often bring fresh perspectives and budget priorities. Reach out to introduce yourself.'
    }
  }

  // Default: press mention
  return {
    type: 'press_mention',
    score: 55,
    play: 'Press coverage - use this as a conversation starter to congratulate them on the media attention.'
  }
}

export async function scanTechCrunch(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []
  const searchTerms = [companyName.toLowerCase(), domain.replace(/\.(com|io|co|ai|dev)$/i, '').toLowerCase()]

  try {
    const feed = await fetchAndParseFeed(TECHCRUNCH_FEED_URL)

    for (const item of feed.items) {
      const textToSearch = `${item.title} ${item.description}`.toLowerCase()
      
      // Check if any search term appears in the article
      const isMatch = searchTerms.some(term => 
        textToSearch.includes(term) && term.length > 2
      )

      if (isMatch) {
        const { type, score, play } = classifySignal(item)

        signals.push({
          source: 'techcrunch',
          type,
          title: item.title,
          snippet: item.description.substring(0, 300),
          url: item.link,
          score,
          play_recommendation: play,
          raw_data: {
            pubDate: item.pubDate?.toISOString(),
            author: item.author,
            feedTitle: feed.title
          }
        })
      }
    }
  } catch (error) {
    console.error('TechCrunch scan error:', error)
    // Don't throw - just return empty results
  }

  return signals
}
