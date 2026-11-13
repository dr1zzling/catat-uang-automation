import { useCallback, useEffect, useRef, useState } from 'react'
import { summarize } from '../lib/period'
import { transactionService } from '../services/api'

export function useDashboardData(userId) {
  const [state, setState] = useState({
    transactions: [],
    summary: null,
    loading: true,
    error: null,
  })
  const requestRef = useRef(0)

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = requestRef.current + 1
      requestRef.current = requestId

      if (!silent) {
        setState((current) => ({ ...current, loading: true, error: null }))
      }

      const [listResult, summaryResult] = await Promise.allSettled([
        transactionService.listAll(userId),
        transactionService.summary(userId),
      ])

      if (requestId !== requestRef.current) return

      if (listResult.status === 'rejected') {
        setState((current) => ({
          ...current,
          loading: false,
          error: listResult.reason,
        }))
        return
      }

      const items = listResult.value.items
      let summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null

      if (!summary) {
        const totals = summarize(items)
        summary = {
          ...totals,
          balance: totals.total_income - totals.total_expense,
        }
      }

      setState({
        transactions: items,
        summary,
        loading: false,
        error: null,
      })
    },
    [userId],
  )

  useEffect(() => {
    reload()
    return () => {
      requestRef.current += 1
    }
  }, [reload])

  return { ...state, reload }
}
