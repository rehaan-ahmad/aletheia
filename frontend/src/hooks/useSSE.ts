import { useState, useEffect, useRef } from 'react'

export type SSEEvent = {
  event: string
  data: any
}

export function useSSE(url: string | null, payload?: any) {
  const [events, setEvents] = useState<SSEEvent[]>([])
  const [status, setStatus] = useState<'idle' | 'connecting' | 'streaming' | 'done' | 'error'>('idle')
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!url || !payload) return
    setStatus('connecting')

    abortControllerRef.current = new AbortController()

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current?.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        setStatus('streaming')
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        if (reader) {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            const lines = buffer.split('\n\n')
            buffer = lines.pop() || '' // last incomplete chunk stays in buffer

            for (const chunk of lines) {
              const linesInChunk = chunk.split('\n')
              let eventName = 'message'
              let dataStr = ''

              for (const line of linesInChunk) {
                if (line.startsWith('event:')) {
                  eventName = line.replace('event:', '').trim()
                } else if (line.startsWith('data:')) {
                  dataStr += line.replace('data:', '').trim()
                }
              }

              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr)
                  const parsedEvent = { event: eventName, data }
                  setLastEvent(parsedEvent)
                  setEvents((prev) => [...prev, parsedEvent])

                  if (eventName === 'done') setStatus('done')
                  if (eventName === 'error') setStatus('error')
                } catch (e) {
                  console.error('JSON parse error on SSE chunk:', e)
                }
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Fetch SSE error:", err)
          setStatus('error')
        }
      }
    }

    fetchData()

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [url, payload])

  return { events, status, lastEvent }
}
