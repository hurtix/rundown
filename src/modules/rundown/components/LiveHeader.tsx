"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause, ArrowLeft, SkipBack, SkipForward, RotateCcw } from "lucide-react"
import { useRundown } from "@/context/RundownContext"

interface LiveHeaderProps {
  rundownTitle: string
  elapsedTime: string
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  onStartShow: () => void
  currentCueDuration: number
  remainingSeconds: number
  totalDuration: number
}

export default function LiveHeader({
  rundownTitle,
  elapsedTime,
  isPlaying,
  onPlayPause,
  onReset,
  onStartShow,
  currentCueDuration,
  remainingSeconds,
  totalDuration,
}: LiveHeaderProps) {
  const router = useRouter()
  const { showStarted, cues, currentCueIndex, goToNextCue, goToPreviousCue } = useRundown()
  const [smoothProgress, setSmoothProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [showEnded, setShowEnded] = useState(false)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const lastRemainingSecondsRef = useRef<number>(remainingSeconds)

  // Update smooth progress with requestAnimationFrame for fluid motion
  useEffect(() => {
    if (!isPlaying) return // Don't animate if not playing

    let animationFrameId: number

    const updateProgress = () => {
      const now = Date.now()
      const timeSinceUpdate = (now - lastUpdateTimeRef.current) / 1000 // Convert to seconds
      
      // Interpolate: calculate where we should be based on elapsed time
      const interpolatedRemaining = Math.max(
        0,
        lastRemainingSecondsRef.current - timeSinceUpdate
      )
      
      const newProgress = currentCueDuration > 0
        ? ((currentCueDuration - interpolatedRemaining) / currentCueDuration) * 100
        : 0
      
      setSmoothProgress(Math.min(100, newProgress))
      animationFrameId = requestAnimationFrame(updateProgress)
    }

    animationFrameId = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(animationFrameId)
  }, [currentCueDuration, isPlaying])

  // Update refs when remainingSeconds changes
  useEffect(() => {
    lastUpdateTimeRef.current = Date.now()
    lastRemainingSecondsRef.current = remainingSeconds
  }, [remainingSeconds])

  // Update current time with GMT-5
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Convert to GMT-5 (UTC-5)
      const gmt5Time = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const hours = gmt5Time.getHours()
      const minutes = gmt5Time.getMinutes()
      const seconds = gmt5Time.getSeconds()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      
      setCurrentTime(
        `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStartShow = () => {
    onStartShow()
  }

  const handleEndShow = () => {
    onPlayPause() // Pause the show
    setShowEnded(true)
  }

  const handleResetShow = () => {
    setShowEnded(false)
    onReset()
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getElapsedDuration = () => {
    if (!showStarted || cues.length === 0) return 0
    
    // Sum duration of all cues before current cue
    let elapsedTime = 0
    for (let i = 0; i < currentCueIndex; i++) {
      elapsedTime += cues[i]?.duration_seconds || 0
    }
    
    // Add the elapsed time of current cue (total duration - remaining)
    const currentCueDurationTotal = cues[currentCueIndex]?.duration_seconds || 0
    elapsedTime += currentCueDurationTotal - remainingSeconds
    
    return elapsedTime
  }

  const getRemainingDuration = () => {
    if (cues.length === 0) return 0
    
    // If show hasn't started, return total duration
    if (!showStarted) {
      return totalDuration
    }
    
    // Sum duration of all cues after current cue
    let remainingTime = 0
    for (let i = currentCueIndex + 1; i < cues.length; i++) {
      remainingTime += cues[i]?.duration_seconds || 0
    }
    
    // Add the remaining time of current cue
    remainingTime += remainingSeconds
    
    return remainingTime
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-[120px] z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="h-full px-3 py-2 flex flex-col gap-2">
        {/* Top Row: Back Button, Timer, and Controls */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button 
            onClick={() => router.push('/rundowns')}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            title="Back to Rundowns"
          >
            <ArrowLeft className="w-5 h-5" />
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
            {!showStarted ? (
              // Before show starts: only Start Show button
              <button
                onClick={handleStartShow}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2 transition-colors font-semibold text-sm"
              >
                <Play className="w-4 h-4" /> Start Show
              </button>
            ) : (
              // After show starts: Play/Pause, Previous Cue, Next Cue
              <>
                {/* Prev Cue Button - Enabled only if not on first cue */}
                <button
                  onClick={goToPreviousCue}
                  disabled={currentCueIndex === 0}
                  className={`px-4 py-2 rounded flex items-center gap-2 transition-colors font-semibold text-sm ${
                    currentCueIndex === 0
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {currentCueIndex >= cues.length - 1 ? (
                  // Last cue: show End Show or Reset Show
                  showEnded ? (
                    <button
                      onClick={handleResetShow}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2 transition-colors font-semibold text-sm"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Show
                    </button>
                  ) : (
                    <button
                      onClick={handleEndShow}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2 transition-colors font-semibold text-sm"
                    >
                      End Show
                    </button>
                  )
                ) : (
                  // Not on last cue: show Pause/Resume
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
                )}

                {/* Next Cue Button - Enabled only if not on last cue */}
                <button
                  onClick={goToNextCue}
                  disabled={currentCueIndex >= cues.length - 1}
                  className={`px-4 py-2 rounded flex items-center gap-2 transition-colors font-semibold text-sm ${
                    currentCueIndex >= cues.length - 1
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <SkipForward className="w-4 h-4" /> Next Cue
                </button>
              </>
            )}
            <div className="flex gap-4 ps-6">
                <div className="flex flex-col text-gray-500 whitespace-nowrap">
                    <span className="text-xs">Showtime Progress</span>
                    <span className="font-mono font-semibold text-gray-300">
                      <span className="text-emerald-400">{formatDuration(getElapsedDuration())}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-amber-400">{formatDuration(getRemainingDuration())}</span>
                    </span>
                </div>
                <div className="flex flex-col text-gray-500 whitespace-nowrap">
                    <span className="text-xs">Time of day (COT)</span>
                    <span className="font-mono font-semibold text-gray-300">{currentTime}</span>
                </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Show Info, Total Duration, and Current Time */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 whitespace-nowrap">
              <span className="font-semibold">{rundownTitle}</span>
            </div>
           
          </div>
        </div>

        {/* Progress Bar - Fixed Gradient with Moving Indicator */}
        <div className="relative w-full flex flex-col rounded-sm overflow-hidden">
          {/* Top section - Black background for pointer visibility */}
          <div className="h-12 bg-gray-950 relative border-b border-gray-800">
            {/* Moving indicator pointer */}
            <div 
              style={{ left: `calc(${smoothProgress}% - 7px)` }} 
              className="absolute top-5 z-10"
            >
              <svg width="14" height="37" viewBox="0 0 14 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 5.58114V5.58125C0.500066 5.88753 0.573079 6.1894 0.712996 6.46185C0.852898 6.73428 1.05566 6.96947 1.30452 7.14796C1.30454 7.14798 1.30457 7.148 1.3046 7.14802L5.49366 10.1537L5.49381 10.1538C5.53992 10.1868 5.57749 10.2304 5.60341 10.2809C5.62933 10.3314 5.64285 10.3873 5.64286 10.444C5.64286 10.444 5.64286 10.444 5.64286 10.444V34.5C5.64286 34.8599 5.78584 35.2051 6.04035 35.4596C6.29486 35.7141 6.64005 35.8571 7 35.8571C7.35995 35.8571 7.70514 35.7141 7.95964 35.4596C8.21416 35.2051 8.35714 34.8599 8.35714 34.5V10.444V10.4437C8.35711 10.3869 8.37061 10.3309 8.39653 10.2804C8.42245 10.2299 8.46004 10.1863 8.50619 10.1532L8.5063 10.1531L12.6954 7.14802C12.6954 7.14801 12.6954 7.148 12.6954 7.14799C12.9443 6.96949 13.1471 6.73429 13.287 6.46185C13.4269 6.18939 13.4999 5.88753 13.5 5.58125V5.58114V2.42857C13.5 1.91708 13.2968 1.42654 12.9351 1.06487C12.5735 0.703188 12.0829 0.5 11.5714 0.5H2.42857C2.17531 0.5 1.92452 0.549884 1.69054 0.646804C1.45655 0.743724 1.24395 0.885781 1.06487 1.06487C0.703188 1.42654 0.5 1.91708 0.5 2.42857V5.58114Z" fill="currentColor" stroke="#161616" className="text-red-600"></path>
              </svg>
            </div>
          </div>
          
          {/* Bottom section - Gradient thermometer bar */}
          <div className="h-4 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600"></div>
        </div>
      </div>
    </header>
  )
}
