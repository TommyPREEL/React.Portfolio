import { describe, expect, it } from 'vitest'
import { getContent } from './i18n'

const en = getContent('en')
const fr = getContent('fr')

type Leaf = { path: string; value: unknown }

/** Describes structure only: object keys, array lengths and leaf types. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [`${path}[len=${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))]
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k))
  }
  return [`${path}:${typeof value}`]
}

function leaves(value: unknown, path = ''): Leaf[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  }
  return [{ path, value }]
}

describe('i18n content', () => {
  it('EN and FR have exactly the same deep key structure and array lengths', () => {
    expect(shape(fr)).toEqual(shape(en))
  })

  it.each([['en', en], ['fr', fr]] as const)('%s has no empty strings', (_lang, content) => {
    const empty = leaves(content)
      // A project without a public site (Airbus apps, self-hosted server) has an intentionally empty link.
      .filter((l) => !/^projects\.items\[\d+\]\.link$/.test(l.path))
      .filter((l) => typeof l.value === 'string' && l.value.trim() === '')
      .map((l) => l.path)
    expect(empty).toEqual([])
  })

  it('project ids are unique and in the same order in EN and FR', () => {
    const enIds = en.projects.items.map((p) => p.id)
    const frIds = fr.projects.items.map((p) => p.id)
    expect(new Set(enIds).size).toBe(enIds.length)
    expect(frIds).toEqual(enIds)
  })

  it.each([['en', en], ['fr', fr]] as const)('%s contains no emoji', (_lang, content) => {
    const emoji = /\p{Extended_Pictographic}/u
    const offenders = leaves(content)
      .filter((l) => typeof l.value === 'string' && emoji.test(l.value))
      .map((l) => l.path)
    expect(offenders).toEqual([])
  })
})
