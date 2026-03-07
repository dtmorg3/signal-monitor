import type { DetectedSignal } from './hacker-news'

// Job board scanner - looks for hiring patterns
// In production, integrate with Greenhouse, Lever, LinkedIn APIs

interface JobPosting {
  title: string
  department: string
  location: string
  url: string
}

export async function scanJobBoards(
  companyName: string,
  domain: string
): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []
  const cleanDomain = domain.replace('.com', '').replace('.io', '').replace('.', '')

  // Try to fetch from Greenhouse (public boards)
  try {
    const greenhouseSignals = await scanGreenhouse(companyName, cleanDomain)
    signals.push(...greenhouseSignals)
  } catch {
    // Greenhouse not available, continue
  }

  // Try to fetch from Lever (public boards)
  try {
    const leverSignals = await scanLever(companyName, cleanDomain)
    signals.push(...leverSignals)
  } catch {
    // Lever not available, continue
  }

  return signals.slice(0, 3)
}

async function scanGreenhouse(companyName: string, boardToken: string): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []

  try {
    // Greenhouse public job board API
    const response = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) return signals

    const data = await response.json()
    const jobs: JobPosting[] = data.jobs || []

    if (jobs.length === 0) return signals

    // Analyze job postings for signals
    const engineeringJobs = jobs.filter(j => 
      j.title.toLowerCase().includes('engineer') ||
      j.title.toLowerCase().includes('developer') ||
      j.department?.toLowerCase().includes('engineering')
    )

    const leadershipJobs = jobs.filter(j =>
      j.title.toLowerCase().includes('director') ||
      j.title.toLowerCase().includes('vp') ||
      j.title.toLowerCase().includes('head of') ||
      j.title.toLowerCase().includes('chief')
    )

    // Engineering hiring signal
    if (engineeringJobs.length >= 3) {
      signals.push({
        source: 'greenhouse',
        type: 'hiring',
        title: `${companyName} is scaling their engineering team`,
        snippet: `Currently hiring for ${engineeringJobs.length} engineering positions including ${engineeringJobs.slice(0, 2).map(j => j.title).join(', ')}`,
        url: `https://boards.greenhouse.io/${boardToken}`,
        score: Math.min(55 + engineeringJobs.length * 5, 85),
        play_recommendation: 'Growing engineering teams need better tools. Offer a demo focused on developer productivity.'
      })
    }

    // Leadership hiring signal
    if (leadershipJobs.length >= 1) {
      const job = leadershipJobs[0]
      signals.push({
        source: 'greenhouse',
        type: 'leadership_change',
        title: `${companyName} is hiring: ${job.title}`,
        snippet: `New leadership position open at ${companyName}`,
        url: job.url || `https://boards.greenhouse.io/${boardToken}`,
        score: 70,
        play_recommendation: 'Leadership transitions create opportunities for new vendor relationships. Time outreach around the hire.'
      })
    }

    // General expansion signal (many open roles)
    if (jobs.length >= 10) {
      signals.push({
        source: 'greenhouse',
        type: 'expansion',
        title: `${companyName} is rapidly growing`,
        snippet: `${jobs.length} open positions across multiple departments`,
        url: `https://boards.greenhouse.io/${boardToken}`,
        score: Math.min(60 + Math.floor(jobs.length / 5) * 5, 80),
        play_recommendation: 'Rapid hiring signals budget and growth. Position as a partner for scaling operations.'
      })
    }

  } catch (error) {
    console.error('Greenhouse scan error:', error)
  }

  return signals
}

async function scanLever(companyName: string, siteToken: string): Promise<DetectedSignal[]> {
  const signals: DetectedSignal[] = []

  try {
    // Lever public job board API
    const response = await fetch(
      `https://api.lever.co/v0/postings/${siteToken}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) return signals

    const jobs = await response.json()

    if (!Array.isArray(jobs) || jobs.length === 0) return signals

    // Analyze for DevOps/Infrastructure roles (indicates scaling)
    const infraJobs = jobs.filter((j: { text: string; categories?: { team?: string } }) =>
      j.text.toLowerCase().includes('devops') ||
      j.text.toLowerCase().includes('infrastructure') ||
      j.text.toLowerCase().includes('platform') ||
      j.text.toLowerCase().includes('sre')
    )

    if (infraJobs.length >= 1) {
      signals.push({
        source: 'lever',
        type: 'tech_adoption',
        title: `${companyName} is investing in infrastructure`,
        snippet: `Hiring for ${infraJobs.length} infrastructure/DevOps positions`,
        url: `https://jobs.lever.co/${siteToken}`,
        score: 65 + infraJobs.length * 5,
        play_recommendation: 'Infrastructure investment indicates scaling challenges. Propose solutions for their technical growth.'
      })
    }

  } catch (error) {
    console.error('Lever scan error:', error)
  }

  return signals
}
