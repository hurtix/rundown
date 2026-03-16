"use client"

import React from "react"
import { Play, Pause, RotateCcw, ChevronDown } from "lucide-react"

interface LiveHeaderProps {
  rundownTitle: string
  elapsedTime: string
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  onEndShow: () => void
}

export default function LiveHeader({
  rundownTitle,
  elapsedTime,
  isPlaying,
  onPlayPause,
  onReset,
  onEndShow,
}: LiveHeaderProps) {
  return (
    <header className="h-[120px] sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/20">
      <div className="h-full px-3 py-2 flex flex-col gap-2">
        {/* Top Row: Collapse, Timer, and Controls */}
        <div className="flex items-center gap-3">
          {/* Collapse Button */}
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Live Indicator + Timer */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div className="font-mono text-2xl font-bold text-white min-w-[120px]">
              {elapsedTime}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-1 items-center ml-4">
            {/* -1m Button */}
            <button
              disabled
              className="px-3 py-1 bg-gray-900 text-gray-400 text-xs rounded transition-colors opacity-50 cursor-not-allowed"
            >
              -1m
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onPlayPause}
              className={`px-4 py-2 rounded flex items-center gap-2 transition-colors font-semibold text-sm ${
                isPlaying
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Resume
                </>
              )}
            </button>

            {/* Previous/Backward Button */}
            <button
              disabled
              className="px-3 py-1 bg-gray-900 text-gray-400 text-xs rounded transition-colors opacity-50 cursor-not-allowed"
            >
              ⏮
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded flex items-center gap-2 transition-colors font-semibold text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>

            {/* +1m Button */}
            <button
              disabled
              className="px-3 py-1 bg-gray-900 text-gray-400 text-xs rounded transition-colors opacity-50 cursor-not-allowed"
            >
              +1m
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Show Info */}
          <div className="text-sm text-gray-400">
            <span className="font-semibold">{rundownTitle}</span>
          </div>

          {/* End Show Button */}
          <button
            onClick={onEndShow}
            className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded text-sm font-semibold transition-colors"
          >
            End show
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 bg-gray-900 rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-red-600 transition-all duration-300"
            style={{ width: "25%" }}
          ></div>
        </div>
      </div>
    </header>
  )
}
