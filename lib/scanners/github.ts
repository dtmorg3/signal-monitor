import type { DetectedSignal } from './hacker-news'

interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  language: string | null
  topics: string[]
}

interface GitHubSearchResult {
  total_count: number
  items: GitHubRepo[]
}

const GITHUB_API = 'https://api.github.com'

export async function scanGitHub(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []
  const orgName = domain.replace('.com', '').replace('.io', '').replace('.', '')

  try {
    // Search for organization repositories
    const searchQuery = `org:${orgName} OR user:${orgName}`
    const response = await fetch(
      `${GITHUB_API}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=updated&per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Signal-Monitor'
        }
      }
    )

    if (!response.ok) {
      // Try alternative search by company name
      const altResponse = await fetch(
        `${GITHUB_API}/search/repositories?q=${encodeURIComponent(companyName)}&sort=stars&per_page=10`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Signal-Monitor'
          }
        }
      )
      
      if (!altResponse.ok) return signals
      
      const altData: GitHubSearchResult = await altResponse.json()
      return processRepos(altData.items, companyName)
    }

    const data: GitHubSearchResult = await response.json()
    return processRepos(data.items, companyName)

  } catch (error) {
    console.error('GitHub scan error:', error)
    return []
  }
}

function processRepos(repos: GitHubRepo[], companyName: string): DetectedSignal[] {
  const signals: DetectedSignal[] = []
  const now = Date.now()

  for (const repo of repos) {
    // Check if recently created (within 90 days)
    const createdDate = new Date(repo.created_at)
    const daysSinceCreated = (now - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Check if recently updated (within 30 days)
    const updatedDate = new Date(repo.updated_at)
    const daysSinceUpdated = (now - updatedDate.getTime()) / (1000 * 60 * 60 * 24)

    // New open source project
    if (daysSinceCreated <= 90 && repo.stargazers_count >= 10) {
      const score = calculateGitHubScore(repo.stargazers_count, repo.forks_count, daysSinceCreated)
      
      signals.push({
        source: 'github',
        type: 'open_source_activity',
        title: `${companyName} open sourced ${repo.name}`,
        snippet: repo.description || `New repository with ${repo.stargazers_count} stars`,
        url: repo.html_url,
        score,
        play_recommendation: 'Engage with their open source work. Consider contributing or sponsoring the project.'
      })
    }
    
    // Active development signals (high activity on existing repo)
    else if (daysSinceUpdated <= 7 && repo.stargazers_count >= 50) {
      const score = calculateGitHubScore(repo.stargazers_count, repo.forks_count, daysSinceUpdated)
      
      signals.push({
        source: 'github',
        type: 'tech_adoption',
        title: `Active development on ${repo.name}`,
        snippet: repo.description || `Repository with ${repo.stargazers_count} stars and recent activity`,
        url: repo.html_url,
        score: Math.min(score, 70), // Cap active dev signals lower
        play_recommendation: 'Their engineering team is active. Reach out with technical content or integration opportunities.'
      })
    }
  }

  // Sort by score and limit
  return signals
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

function calculateGitHubScore(stars: number, forks: number, daysSince: number): number {
  // Base score from stars (0-50)
  let score = Math.min(Math.log10(stars + 1) * 20, 50)
  
  // Add score from forks (0-20)
  score += Math.min(Math.log10(forks + 1) * 10, 20)
  
  // Recency bonus (0-30)
  const recencyBonus = Math.max(0, 30 - daysSince)
  score += recencyBonus
  
  return Math.min(Math.round(score), 100)
}
