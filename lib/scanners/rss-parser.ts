// Simple RSS/Atom feed parser - no external dependencies
// Parses XML feeds into a normalized format

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: Date | null
  author: string | null
}

export interface ParsedFeed {
  title: string
  items: FeedItem[]
}

function extractText(xml: string, tag: string): string | null {
  // Handle both regular tags and CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : null
}

function extractLink(xml: string): string | null {
  // RSS format
  const linkTag = extractText(xml, 'link')
  if (linkTag && !linkTag.startsWith('<')) return linkTag

  // Atom format - <link href="..."/>
  const atomMatch = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)
  if (atomMatch) return atomMatch[1]

  return null
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function parseRSSFeed(xml: string): ParsedFeed {
  const feedTitle = extractText(xml, 'title') || 'Unknown Feed'
  const items: FeedItem[] = []

  // Match RSS <item> or Atom <entry> elements
  const itemRegex = /<(item|entry)[\s>]([\s\S]*?)<\/\1>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[2]

    const title = extractText(itemXml, 'title')
    const link = extractLink(itemXml)
    const description = extractText(itemXml, 'description') || 
                        extractText(itemXml, 'summary') ||
                        extractText(itemXml, 'content') || ''
    const pubDate = parseDate(
      extractText(itemXml, 'pubDate') || 
      extractText(itemXml, 'published') ||
      extractText(itemXml, 'updated')
    )
    const author = extractText(itemXml, 'author') || 
                   extractText(itemXml, 'dc:creator')

    if (title && link) {
      items.push({
        title,
        link,
        description: description.replace(/<[^>]*>/g, '').substring(0, 500), // Strip HTML, limit length
        pubDate,
        author
      })
    }
  }

  return { title: feedTitle, items }
}

export async function fetchAndParseFeed(url: string): Promise<ParsedFeed> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SignalMonitor/1.0 (RSS Reader)',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`)
  }

  const xml = await response.text()
  return parseRSSFeed(xml)
}
