"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Slide {
  id: number
  image: string
  ctaText?: string
  ctaLink?: string
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/hero-slider/all_products.png",
    ctaText: "Vezi Produsele",
    ctaLink: "/produse",
  },
  {
    id: 2,
    image: "/images/hero-slider/patisery.png",
    ctaText: "Descoperă Gama",
    ctaLink: "/produse",
  },
  {
    id: 3,
    image: "/images/hero-slider/personalisation.png",
  },
  {
    id: 4,
    image: "/images/hero-slider/buy_more_pay_less.png",
  },
]

const OffersSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  const slide = slides[currentSlide]

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            className="object-cover"
            priority={slide.id === 1}
            sizes="100vw"
            quality={85}
          />

          {slide.ctaText && slide.ctaLink && (
            <div className="absolute inset-0 z-10 flex items-end justify-center pb-16 md:pb-20">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <LocalizedClientLink
                  href={slide.ctaLink}
                  className="inline-flex items-center px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {slide.ctaText}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </LocalizedClientLink>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Preload next slide */}
      {slides.map((s, index) =>
        index !== currentSlide && index !== 0 ? (
          <Image
            key={s.id}
            src={s.image}
            alt=""
            fill
            className="object-cover opacity-0 pointer-events-none"
            sizes="100vw"
            quality={85}
            aria-hidden
          />
        ) : null
      )}

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={() => {
          prevSlide()
          setIsAutoPlaying(false)
          setTimeout(() => setIsAutoPlaying(true), 10000)
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors duration-200"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={() => {
          nextSlide()
          setIsAutoPlaying(false)
          setTimeout(() => setIsAutoPlaying(true), 10000)
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors duration-200"
        aria-label="Slide următor"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: isAutoPlaying ? "100%" : "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>
    </section>
  )
}

export default OffersSlideshow
