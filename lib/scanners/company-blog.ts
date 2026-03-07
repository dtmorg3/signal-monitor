import { fetchAndParseFeed, type FeedItem } from './rss-parser'
import type { DetectedSignal } from './hacker-news'
import type { SignalType } from '../types'

// Common blog URL patterns to try
function getBlogFeedUrls(domain: string): string[] {
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
  
  return [
    // Most common patterns
    `https://blog.${cleanDomain}/feed`,
    `https://blog.${cleanDomain}/rss`,
    `https://blog.${cleanDomain}/feed.xml`,
    `https://blog.${cleanDomain}/rss.xml`,
    `https://blog.${cleanDomain}/atom.xml`,
    `https://${cleanDomain}/blog/feed`,
    `https://${cleanDomain}/blog/rss`,
    `https://${cleanDomain}/blog/feed.xml`,
    `https://${cleanDomain}/blog/rss.xml`,
    `https://www.${cleanDomain}/blog/feed`,
    `https://www.${cleanDomain}/blog/feed.xml`,
    // Engineering blogs
    `https://engineering.${cleanDomain}/feed`,
    `https://${cleanDomain}/engineering/feed`,
    // News/updates sections
    `https://${cleanDomain}/news/feed`,
    `https://${cleanDomain}/updates/feed`,
  ]
}

function classifyBlogPost(item: FeedItem): { type: SignalType; score: number; play: string } {
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Product updates/launches
  if (text.includes('launch') || text.includes('introducing') || text.includes('announcing') ||
      text.includes('new feature') || text.includes('release') || text.includes('now available')) {
    return {
      type: 'product_launch',
      score: 80,
      play: 'Product update from their blog - they are investing in this area. Discuss how you complement their direction.'
    }
  }

  // Technical/engineering posts
  if (text.includes('how we') || text.includes('engineering') || text.includes('architecture') ||
      text.includes('scaling') || text.includes('infrastructure') || text.includes('migrat')) {
    return {
      type: 'tech_adoption',
      score: 72,
      play: 'Engineering blog post reveals tech stack decisions - use this intel to tailor your pitch to their architecture.'
    }
  }

  // Hiring/culture posts
  if (text.includes('hiring') || text.includes('join us') || text.includes('team') ||
      text.includes('culture') || text.includes('careers') || text.includes('we\'re growing')) {
    return {
      type: 'hiring',
      score: 68,
      play: 'Culture/hiring post indicates growth focus - discuss how you support scaling teams.'
    }
  }

  // Case studies/customer success
  if (text.includes('case study') || text.includes('customer') || text.includes('how') ||
      text.includes('success story') || text.includes('results')) {
    return {
      type: 'expansion',
      score: 65,
      play: 'Customer success content shows their GTM motion - reference this when positioning your value prop.'
    }
  }

  // Partnership announcements
  if (text.includes('partner') || text.includes('integration') || text.includes('together')) {
    return {
      type: 'partnership',
      score: 70,
      play: 'Partnership content - explore integration opportunities in their ecosystem.'
    }
  }

  // Default: general content signal
  return {
    type: 'press_mention',
    score: 45,
    play: 'Recent blog activity shows they are investing in content - good sign of active company.'
  }
}

async function tryFetchFeed(url: string): Promise<{ success: true; feed: Awaited<ReturnType<typeof fetchAndParseFeed>> } | { success: false }> {
  try {
    const feed = await fetchAndParseFeed(url)
    if (feed.items.length > 0) {
      return { success: true, feed }
    }
    return { success: false }
  } catch {
    return { success: false }
  }
}

export async function scanCompanyBlog(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []
  const feedUrls = getBlogFeedUrls(domain)

  // Try each potential blog URL until we find one that works
  for (const feedUrl of feedUrls) {
    const result = await tryFetchFeed(feedUrl)
    
    if (result.success) {
      const feed = result.feed
      
      // Take recent posts (last 5)
      const recentPosts = feed.items.slice(0, 5)

      for (const item of recentPosts) {
        const { type, score, play } = classifyBlogPost(item)

        // Boost score for very recent posts (within 30 days)
        const recencyBoost = item.pubDate && 
          (Date.now() - item.pubDate.getTime()) < 30 * 24 * 60 * 60 * 1000 ? 10 : 0

        signals.push({
          source: 'company_blog',
          type,
          title: item.title,
          snippet: item.description.substring(0, 300),
          url: item.link,
          score: Math.min(score + recencyBoost, 100),
          play_recommendation: play,
          raw_data: {
            pubDate: item.pubDate?.toISOString(),
            feedUrl,
            author: item.author
          }
        })
      }

      // Found a working feed, no need to try others
      break
    }
  }

  return signals
}
