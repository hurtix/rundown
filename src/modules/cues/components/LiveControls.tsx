"use client"

interface LiveControlsProps {
  onNext: () => void
  onPrevious: () => void
  canNext: boolean
  canPrevious: boolean
}

export default function LiveControls({
  onNext,
  onPrevious,
  canNext,
  canPrevious,
}: LiveControlsProps) {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-6">
      <div className="flex gap-4 justify-center">
        <button
          onClick={onPrevious}
          disabled={!canPrevious}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
            canPrevious
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
            canNext
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
