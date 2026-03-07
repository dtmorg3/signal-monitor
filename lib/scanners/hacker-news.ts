import type { SignalSource, SignalType } from '@/lib/types'

interface HNItem {
  id: number
  title: string
  url?: string
  text?: string
  by: string
  time: number
  score: number
  descendants?: number
}

interface HNSearchResult {
  hits: Array<{
    objectID: string
    title: string
    url?: string
    story_text?: string
    author: string
    created_at: string
    points: number
    num_comments: number
  }>
}

export interface DetectedSignal {
  source: SignalSource
  type: SignalType
  title: string
  snippet: string
  url: string
  score: number
  play_recommendation: string
}

const HN_ALGOLIA_API = 'https://hn.algolia.com/api/v1'

export async function scanHackerNews(
  companyName: string, 
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []
  
  try {
    // Search for mentions of the company
    const searchQueries = [
      companyName,
      domain.replace('.com', '').replace('.io', ''),
    ]

    for (const query of searchQueries) {
      const response = await fetch(
        `${HN_ALGOLIA_API}/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`
      )

      if (!response.ok) continue

      const data: HNSearchResult = await response.json()

      for (const hit of data.hits) {
        // Skip old posts (older than 90 days)
        const postDate = new Date(hit.created_at)
        const daysSincePost = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSincePost > 90) continue

        // Determine signal type based on content
        const signalInfo = classifyHNPost(hit.title, hit.story_text || '')
        if (!signalInfo) continue

        // Calculate relevance score based on HN engagement
        const engagementScore = calculateEngagementScore(hit.points, hit.num_comments)
        
        signals.push({
          source: 'hacker_news',
          type: signalInfo.type,
          title: hit.title,
          snippet: hit.story_text?.slice(0, 200) || `Discussion with ${hit.num_comments} comments`,
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          score: engagementScore,
          play_recommendation: signalInfo.recommendation
        })
      }
    }

    // Deduplicate by URL
    const uniqueSignals = signals.filter((signal, index, self) =>
      index === self.findIndex(s => s.url === signal.url)
    )

    return uniqueSignals.slice(0, 5) // Limit to top 5

  } catch (error) {
    console.error('HN scan error:', error)
    return []
  }
}

function classifyHNPost(title: string, text: string): { type: SignalType; recommendation: string } | null {
  const content = `${title} ${text}`.toLowerCase()

  // Product launch signals
  if (content.includes('launch') || content.includes('introducing') || content.includes('announcing')) {
    return {
      type: 'product_launch',
      recommendation: 'Congratulate them on the launch and offer to discuss how your solution can support their growth.'
    }
  }

  // Hiring signals
  if (content.includes('hiring') || content.includes('jobs') || content.includes('we are looking')) {
    return {
      type: 'hiring',
      recommendation: 'Growing teams often need new tools. Reach out to discuss scaling challenges.'
    }
  }

  // Funding signals
  if (content.includes('raised') || content.includes('funding') || content.includes('series')) {
    return {
      type: 'funding',
      recommendation: 'Fresh funding means budget for new initiatives. Request an intro meeting.'
    }
  }

  // Tech adoption / Show HN
  if (content.includes('show hn') || content.includes('open source') || content.includes('github')) {
    return {
      type: 'tech_adoption',
      recommendation: 'Engage with their technical content. Consider sponsoring or contributing.'
    }
  }

  // Community engagement (AMA, discussion)
  if (content.includes('ama') || content.includes('ask hn') || content.includes('discussion')) {
    return {
      type: 'community_engagement',
      recommendation: 'Join the conversation with valuable insights to build relationship.'
    }
  }

  // Press mentions
  if (content.includes('announce') || content.includes('news') || content.includes('report')) {
    return {
      type: 'press_mention',
      recommendation: 'Reference the news in your outreach to show you follow their progress.'
    }
  }

  return null
}

function calculateEngagementScore(points: number, comments: number): number {
  // Base score from points (0-50)
  let score = Math.min(points / 10, 50)
  
  // Add score from comments (0-30)
  score += Math.min(comments / 5, 30)
  
  // Normalize to 0-100
  score = Math.min(Math.round(score + 20), 100)
  
  return score
}
