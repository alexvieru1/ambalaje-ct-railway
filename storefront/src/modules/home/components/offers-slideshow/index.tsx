"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  backgroundColor: string
  accentColor: string
  badge?: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Cutii de Carton Premium",
    subtitle: "Ofertă Specială de Iarnă",
    description:
      "Până la 30% reducere la comenzile de peste 500 bucăți. Livrare gratuită în Constanța!",
    ctaText: "Vezi Oferta",
    ctaLink: "/produse",
    backgroundColor: "from-amber-600 to-orange-700",
    accentColor: "bg-amber-400",
    badge: "-30%",
  },
  {
    id: 2,
    title: "Ambalaje Alimentare",
    subtitle: "Noi în Stoc",
    description:
      "Caserole, pungi și folii pentru industria alimentară. Certificate pentru contact alimentar.",
    ctaText: "Descoperă Gama",
    ctaLink: "/produse",
    backgroundColor: "from-emerald-600 to-teal-700",
    accentColor: "bg-emerald-400",
    badge: "NOU",
  },
  {
    id: 3,
    title: "Pungi Personalizate",
    subtitle: "Brand-ul Tău, Ambalajul Nostru",
    description:
      "Personalizează pungile cu logo-ul companiei tale. Cantitate minimă: 1000 bucăți.",
    ctaText: "Solicită Ofertă",
    ctaLink: "/contact",
    backgroundColor: "from-violet-600 to-purple-700",
    accentColor: "bg-violet-400",
  },
  {
    id: 4,
    title: "Folie Stretch & Buble",
    subtitle: "Protecție Maximă",
    description:
      "Soluții complete pentru ambalare și protecție. Prețuri speciale pentru comenzi en-gros.",
    ctaText: "Vezi Produsele",
    ctaLink: "/produse",
    backgroundColor: "from-sky-600 to-blue-700",
    accentColor: "bg-sky-400",
    badge: "PROMO",
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
    // Resume auto-play after 10 seconds
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
          className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor}`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 border-4 border-white rounded-full" />
            <div className="absolute bottom-20 left-10 w-48 h-48 border-4 border-white rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 border-4 border-white rotate-45" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl text-white"
            >
              {/* Badge */}
              {slide.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className={`inline-block px-4 py-1 ${slide.accentColor} text-gray-900 font-bold text-sm rounded-full mb-4`}
                >
                  {slide.badge}
                </motion.span>
              )}

              {/* Subtitle */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg md:text-xl font-medium mb-2"
              >
                {slide.subtitle}
              </motion.p>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              >
                {slide.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-xl"
              >
                {slide.description}
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <LocalizedClientLink
                  href={slide.ctaLink}
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {slide.ctaText}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </LocalizedClientLink>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          prevSlide()
          setIsAutoPlaying(false)
          setTimeout(() => setIsAutoPlaying(true), 10000)
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors duration-200"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => {
          nextSlide()
          setIsAutoPlaying(false)
          setTimeout(() => setIsAutoPlaying(true), 10000)
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors duration-200"
        aria-label="Slide următor"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
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
