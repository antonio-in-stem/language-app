import { useCallback, useEffect, useState } from "react"

type WordPair = {
  french: string
  english: string
}

const SCENE_INTERVAL_MS = 7_000

const pickRandomIndex = (length: number, exclude?: number): number => {
  if (length <= 1) return 0

  let next = Math.floor(Math.random() * length)
  while (next === exclude) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

const BACKGROUND_COLORS = [
  "#1e3a5f",
  "#4a1942",
  "#1a4d3e",
  "#5c3d1e",
  "#2d3a6b",
  "#6b2d3a",
  "#1f4d5c",
  "#3d5c1e",
  "#4d1f5c",
  "#5c4a1f",
]

const App = () => {
  const [words, setWords] = useState<WordPair[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}words.json`)

        if (!response.ok) {
          throw new Error(`Failed to load words (${response.status})`)
        }

        const data: WordPair[] = await response.json()
        setWords(data)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load words"
        setLoadError(message)
      }
    }

    loadWords()
  }, [])

  useEffect(() => {
    if (words.length === 0) return

    setWordIndex(pickRandomIndex(words.length))
    setColorIndex(pickRandomIndex(BACKGROUND_COLORS.length))
  }, [words])

  const advanceScene = useCallback(() => {
    if (words.length === 0) return

    setWordIndex((current) => pickRandomIndex(words.length, current))
    setColorIndex((current) =>
      pickRandomIndex(BACKGROUND_COLORS.length, current),
    )
  }, [words.length])

  useEffect(() => {
    if (words.length === 0) return

    const timerId = window.setInterval(advanceScene, SCENE_INTERVAL_MS)

    return () => window.clearInterval(timerId)
  }, [words.length, advanceScene])

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-red-300">
        <p role="alert">{loadError}</p>
      </main>
    )
  }

  if (words.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <p aria-live="polite">Loading…</p>
      </main>
    )
  }

  const current = words[wordIndex]
  const backgroundColor = BACKGROUND_COLORS[colorIndex]

  return (
    <main
      className="flex min-h-screen w-full flex-col items-center justify-center px-8 transition-colors duration-700 ease-in-out"
      style={{ backgroundColor }}
      aria-live="polite"
      aria-atomic="true"
    >
      <h1 className="max-w-4xl text-center text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl">
        {current.french}
      </h1>
      <p className="mt-6 max-w-2xl text-center text-xl font-light text-white/85 sm:text-2xl md:text-3xl">
        {current.english}
      </p>
    </main>
  )
}

export default App
