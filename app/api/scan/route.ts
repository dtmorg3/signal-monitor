import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runFullScan } from '@/lib/scanners'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accountId, accountIds } = body

    // Determine which accounts to scan
    const idsToScan: string[] = accountIds || (accountId ? [accountId] : [])
    
    if (idsToScan.length === 0) {
      return NextResponse.json({ error: 'No accounts specified' }, { status: 400 })
    }

    // Fetch account details
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .in('id', idsToScan)
      .eq('user_id', user.id)

    if (accountsError || !accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'Accounts not found' }, { status: 404 })
    }

    const results = []

    for (const account of accounts) {
      // Create scan record
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          account_id: account.id,
          status: 'running'
        })
        .select()
        .single()

      if (scanError || !scan) {
        console.error('Failed to create scan:', scanError)
        continue
      }

      try {
        // Run the full scan using all scanner modules
        const scanResult = await runFullScan(account.name, account.domain)

        // Insert detected signals
        if (scanResult.signals.length > 0) {
          const signalsToInsert = scanResult.signals.map(signal => ({
            user_id: user.id,
            account_id: account.id,
            scan_id: scan.id,
            source: signal.source,
            type: signal.type,
            title: signal.title,
            snippet: signal.snippet,
            url: signal.url,
            score: signal.score,
            play_recommendation: signal.play_recommendation
          }))

          const { error: signalsError } = await supabase
            .from('signals')
            .insert(signalsToInsert)

          if (signalsError) {
            console.error('Failed to insert signals:', signalsError)
          }
        }

        // Mark scan as completed
        await supabase
          .from('scans')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', scan.id)

        results.push({
          accountId: account.id,
          scanId: scan.id,
          signalsDetected: scanResult.signals.length,
          scannedSources: scanResult.scannedSources,
          errors: scanResult.errors,
          status: 'completed'
        })

      } catch (error) {
        // Mark scan as failed
        await supabase
          .from('scans')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', scan.id)

        results.push({
          accountId: account.id,
          scanId: scan.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ results })

  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
