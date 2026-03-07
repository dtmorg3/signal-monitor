import { fetchAndParseFeed, type FeedItem } from './rss-parser'
import type { DetectedSignal } from './hacker-news'
import type { SignalType } from '../types'

// PR Newswire RSS feeds by category
const PR_NEWSWIRE_FEEDS = {
  technology: 'https://www.prnewswire.com/rss/technology-latest-news.rss',
  business: 'https://www.prnewswire.com/rss/business-latest-news.rss'
}

function classifyPressRelease(item: FeedItem): { type: SignalType; score: number; play: string } {
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Funding announcements
  if (text.includes('raises') || text.includes('funding') || text.includes('investment') ||
      text.includes('series a') || text.includes('series b') || text.includes('series c') ||
      text.includes('seed round') || text.includes('venture')) {
    return {
      type: 'funding',
      score: 88,
      play: 'Official funding press release - highly credible signal. Reach out to congratulate and discuss their expansion plans.'
    }
  }

  // Product launches
  if (text.includes('launches') || text.includes('introduces') || text.includes('unveils') ||
      text.includes('announces new') || text.includes('releases') || text.includes('debuts')) {
    return {
      type: 'product_launch',
      score: 78,
      play: 'Official product announcement - great opportunity to discuss integration or complementary solutions.'
    }
  }

  // Partnerships
  if (text.includes('partners with') || text.includes('partnership') || text.includes('collaboration') ||
      text.includes('alliance') || text.includes('teams up') || text.includes('joins')) {
    return {
      type: 'partnership',
      score: 75,
      play: 'Partnership announcement - explore how you can be part of their growing ecosystem.'
    }
  }

  // Expansion
  if (text.includes('expands') || text.includes('opens') || text.includes('enters') ||
      text.includes('expansion') || text.includes('new office') || text.includes('new market')) {
    return {
      type: 'expansion',
      score: 72,
      play: 'Expansion press release - discuss how you can support their growth initiatives.'
    }
  }

  // Leadership
  if (text.includes('appoints') || text.includes('names') || text.includes('promotes') ||
      text.includes('ceo') || text.includes('cto') || text.includes('cfo') || text.includes('joins as')) {
    return {
      type: 'leadership_change',
      score: 70,
      play: 'Executive announcement - new leadership often means new priorities. Introduce yourself early.'
    }
  }

  // Awards/recognition
  if (text.includes('award') || text.includes('recognized') || text.includes('named') ||
      text.includes('ranked') || text.includes('leader in')) {
    return {
      type: 'press_mention',
      score: 55,
      play: 'Recognition/award - congratulate them and use as a relationship touchpoint.'
    }
  }

  // Default
  return {
    type: 'press_mention',
    score: 50,
    play: 'Press release detected - review for relevant business signals.'
  }
}

export async function scanPRNewswire(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []
  const searchTerms = [
    companyName.toLowerCase(),
    domain.replace(/\.(com|io|co|ai|dev)$/i, '').toLowerCase()
  ]

  try {
    // Scan both tech and business feeds
    const feeds = await Promise.allSettled([
      fetchAndParseFeed(PR_NEWSWIRE_FEEDS.technology),
      fetchAndParseFeed(PR_NEWSWIRE_FEEDS.business)
    ])

    for (const result of feeds) {
      if (result.status !== 'fulfilled') continue

      const feed = result.value
      
      for (const item of feed.items) {
        const textToSearch = `${item.title} ${item.description}`.toLowerCase()

        // Check if company is mentioned
        const isMatch = searchTerms.some(term =>
          textToSearch.includes(term) && term.length > 2
        )

        if (isMatch) {
          const { type, score, play } = classifyPressRelease(item)

          signals.push({
            source: 'pr_newswire',
            type,
            title: item.title,
            snippet: item.description.substring(0, 300),
            url: item.link,
            score,
            play_recommendation: play,
            raw_data: {
              pubDate: item.pubDate?.toISOString(),
              feedCategory: feed.title
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('PR Newswire scan error:', error)
  }

  return signals
}
