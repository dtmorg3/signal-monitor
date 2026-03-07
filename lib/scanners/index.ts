import { scanHackerNews, type DetectedSignal } from './hacker-news'
import { scanGitHub } from './github'
import { scanJobBoards } from './job-boards'
import { scanTechCrunch } from './techcrunch'
import { scanGoogleNews } from './google-news'
import { scanPRNewswire } from './pr-newswire'
import { scanCompanyBlog } from './company-blog'

export type { DetectedSignal }

export interface ScanResult {
  signals: DetectedSignal[]
  scannedSources: string[]
  errors: string[]
}

export async function runFullScan(
  companyName: string,
  domain: string
): Promise<ScanResult> {
  const signals: DetectedSignal[] = []
  const scannedSources: string[] = []
  const errors: string[] = []

  // Run all scanners in parallel
  const scanners = [
    { name: 'Hacker News', fn: () => scanHackerNews(companyName, domain) },
    { name: 'GitHub', fn: () => scanGitHub(companyName, domain) },
    { name: 'Job Boards', fn: () => scanJobBoards(companyName, domain) },
    { name: 'TechCrunch', fn: () => scanTechCrunch(companyName, domain) },
    { name: 'Google News', fn: () => scanGoogleNews(companyName, domain) },
    { name: 'PR Newswire', fn: () => scanPRNewswire(companyName, domain) },
    { name: 'Company Blog', fn: () => scanCompanyBlog(companyName, domain) },
  ]

  const results = await Promise.allSettled(
    scanners.map(async (scanner) => {
      try {
        const scannerSignals = await scanner.fn()
        return { name: scanner.name, signals: scannerSignals }
      } catch (error) {
        throw { name: scanner.name, error }
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      signals.push(...result.value.signals)
      scannedSources.push(result.value.name)
    } else {
      const reason = result.reason as { name: string; error: Error }
      errors.push(`${reason.name}: ${reason.error.message}`)
    }
  }

  // Sort all signals by score (highest first)
  signals.sort((a, b) => b.score - a.score)

  return {
    signals,
    scannedSources,
    errors
  }
}
