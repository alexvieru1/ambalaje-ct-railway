/* eslint-disable */
const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const targets = [
  { src: "public/images/team.png", maxWidth: 1600 },
  { src: "public/images/hero-slider/all_products.png", maxWidth: 1920 },
  { src: "public/images/hero-slider/buy_more_pay_less.png", maxWidth: 1920 },
  { src: "public/images/hero-slider/patisery.png", maxWidth: 1920 },
  { src: "public/images/hero-slider/personalisation.png", maxWidth: 1920 },
]

const backupDir = "public/images/_originals"
fs.mkdirSync(backupDir, { recursive: true })

;(async () => {
  for (const { src, maxWidth } of targets) {
    if (!fs.existsSync(src)) {
      console.log("skip (missing):", src)
      continue
    }

    const beforeBytes = fs.statSync(src).size
    const beforeMeta = await sharp(src).metadata()

    const backupPath = path.join(backupDir, path.basename(src))
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(src, backupPath)
    }

    const tmp = src + ".tmp"
    await sharp(src)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(tmp)
    fs.renameSync(tmp, src)

    const afterBytes = fs.statSync(src).size
    const afterMeta = await sharp(src).metadata()

    const fmt = (b) => (b / 1024 / 1024).toFixed(2) + "MB"
    const ratio = (beforeBytes / afterBytes).toFixed(1)
    console.log(
      `${src}\n  ${beforeMeta.width}x${beforeMeta.height} ${fmt(beforeBytes)}` +
        ` → ${afterMeta.width}x${afterMeta.height} ${fmt(afterBytes)} (${ratio}× smaller)`
    )
  }
})()
