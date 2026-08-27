import {
  buildSuggestionIndex,
  codeSimilarity,
  editDistance,
  normalize,
  similarity,
  suggestSmartBillMatches,
  tokenize,
} from './suggest'
import type { SmartBillStockProduct } from './types'

const product = (
  productCode: string,
  productName: string,
  quantity = 1,
): SmartBillStockProduct => ({
  productCode,
  productName,
  quantity,
  measuringUnit: 'BUC',
})

describe('normalize', () => {
  it('folds Romanian diacritics so both catalogues compare equal', () => {
    expect(normalize('Platformă tort pătrată argintie')).toBe(
      'PLATFORMA TORT PATRATA ARGINTIE',
    )
    expect(normalize('Cutie înălțime șase')).toBe('CUTIE INALTIME SASE')
  })
})

describe('tokenize', () => {
  it('splits digits away from letters so 25ST yields 25 and ST', () => {
    expect(tokenize('SACOSE CMB ROSU 25ST')).toEqual(['SACOSE', 'CMB', 'ROSU', '25', 'ST'])
  })

  it('breaks dimension strings into their numbers, dropping the x separator', () => {
    expect(tokenize('PLANSETA 24X44/10BC')).toEqual([
      'PLANSETA', '24', '44', '10', 'BC',
    ])
  })

  it('drops packaging stopwords that identify nothing', () => {
    expect(tokenize('CUTIE DE TORT CU SET')).toEqual(['CUTIE', 'TORT'])
  })

  it('keeps single digits but drops single letters', () => {
    expect(tokenize('A 5 BB')).toEqual(['5', 'BB'])
  })
})

describe('similarity', () => {
  it('scores identical token lists as 1', () => {
    expect(similarity(['CUTIE', '25'], ['CUTIE', '25'])).toBe(1)
  })

  it('scores disjoint token lists as 0', () => {
    expect(similarity(['CUTIE'], ['SACOSA'])).toBe(0)
  })

  it('weights a shared number above a shared word', () => {
    const sharedNumber = similarity(['CUTIE', '25'], ['TAVA', '25'])
    const sharedWord = similarity(['CUTIE', '25'], ['CUTIE', '40'])
    expect(sharedNumber).toBeGreaterThan(sharedWord)
  })

  it('returns 0 when either side is empty', () => {
    expect(similarity([], ['CUTIE'])).toBe(0)
    expect(similarity(['CUTIE'], [])).toBe(0)
  })
})

describe('suggestSmartBillMatches', () => {
  const index = buildSuggestionIndex([
    product('1216', 'PLANSETA 24X44/10BC (DGB-RS)'),
    product('1215', 'CUTIE SB1 F NATUR'),
    product('1213', 'CUTIE MAC3 ALBA'),
    product('1212', 'CUTIE MAC1 ALBA'),
    product('1219', 'TAVA APOLLO AUR 24X34(TSG-A-09)50ST'),
  ])

  it('ranks the closest catalogue name first', () => {
    const [best] = suggestSmartBillMatches('Cutie MAC1 albă', index)
    expect(best.product_code).toBe('1212')
  })

  it('uses dimensions to separate otherwise similar names', () => {
    const [best] = suggestSmartBillMatches('Planșetă 24x44', index)
    expect(best.product_code).toBe('1216')
  })

  it('returns nothing when no name is close enough', () => {
    expect(suggestSmartBillMatches('Bandă adezivă transparentă', index)).toEqual([])
  })

  it('returns nothing for an untokenizable title', () => {
    expect(suggestSmartBillMatches('   ', index)).toEqual([])
  })

  it('caps the number of suggestions', () => {
    expect(suggestSmartBillMatches('Cutie albă', index, { limit: 2 }).length).toBeLessThanOrEqual(2)
  })

  it('orders results by descending score', () => {
    const results = suggestSmartBillMatches('Cutie MAC1 albă', index, { limit: 5 })
    const scores = results.map((r) => r.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
  })
})

describe('editDistance', () => {
  it('measures single-character edits', () => {
    expect(editDistance('449', '449')).toBe(0)
    expect(editDistance('449', '448')).toBe(1)
    expect(editDistance('449', '4499')).toBe(1)
  })

  it('gives up early once the length gap exceeds the cap', () => {
    expect(editDistance('1', '123456')).toBeGreaterThan(2)
  })
})

describe('codeSimilarity', () => {
  it('scores an extra trailing digit as a near-certain match', () => {
    // The real pattern in this catalogue: 4499 typed for 449.
    expect(codeSimilarity('4499', '449')).toBe(0.95)
    expect(codeSimilarity('10600', '1060')).toBe(0.95)
  })

  it('scores two extra digits lower but still worth showing', () => {
    expect(codeSimilarity('13755', '137')).toBe(0.75)
  })

  it('scores a single substitution below a trailing digit', () => {
    expect(codeSimilarity('449', '448')).toBe(0.85)
  })

  it('ignores an exact match — it would not be an issue row', () => {
    expect(codeSimilarity('449', '449')).toBe(0)
  })

  it('ignores unrelated codes', () => {
    expect(codeSimilarity('449', '1826')).toBe(0)
  })

  it('ignores three or more appended characters', () => {
    expect(codeSimilarity('449123', '449')).toBe(0)
  })
})

describe('suggestSmartBillMatches with a SKU', () => {
  const index = buildSuggestionIndex([
    { productCode: '449', productName: 'CUTIE PATISERIE K2 13X10X8 /190ST', quantity: 265, measuringUnit: 'BUC' },
    { productCode: '883', productName: 'CUT PATISERIE K10/22X215/95BC', quantity: 272, measuringUnit: 'BUC' },
    { productCode: '1826', productName: 'ALTCEVA COMPLET DIFERIT', quantity: 3, measuringUnit: 'BUC' },
  ])

  it('surfaces the code the SKU was mistyped from', () => {
    const [best] = suggestSmartBillMatches('Cutie prăjituri Pastry 13x10xH8 K2', index, {
      sku: '4499',
    })
    expect(best.product_code).toBe('449')
    expect(best.reason).toBe('code+name')
  })

  it('still finds the code when the name gives no signal', () => {
    const [best] = suggestSmartBillMatches('Ceva fără legătură', index, { sku: '8833' })
    expect(best.product_code).toBe('883')
    expect(best.reason).toBe('code')
  })

  it('ranks a match backed by both signals above one backed by name alone', () => {
    const results = suggestSmartBillMatches('Cutie patiserie K2 13x10x8', index, {
      sku: '4499',
    })
    expect(results[0].product_code).toBe('449')
    expect(results[0].score).toBeGreaterThan(0.95)
  })

  it('falls back to name-only scoring when no SKU is given', () => {
    const [best] = suggestSmartBillMatches('Cutie patiserie K2 13x10x8', index)
    expect(best.reason).toBe('name')
  })
})
