import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ygsyiknejwhabwqmotxc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc3lpa25landoYWJ3cW1vdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Nzg2MTcsImV4cCI6MjA5MzU1NDYxN30.h1sYAmGQSAnM-SMY01YNCcLyJLQO8zcfnKqKpSI1vgU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBPlayer {
  username: string
  password_hash: string
  xp: number
  gold: number
  rebirths: number
  inventory: unknown[]
  name_tags: unknown[]
  discovered_eggs: string[]
  atk_buff: number
  is_banned: boolean
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function dbRegister(
  username: string,
  passwordHash: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('players').insert({
    username: username.toLowerCase(),
    password_hash: passwordHash,
    xp: 0, gold: 50, rebirths: 0,
    inventory: [], name_tags: [], discovered_eggs: [], atk_buff: 0,
    is_banned: false,
  })
  if (error) {
    if (error.code === '23505') return { error: 'Username already taken.' }
    return { error: error.message }
  }
  return { error: null }
}

export async function dbLogin(
  username: string,
  passwordHash: string,
): Promise<{ player: DBPlayer | null; error: string | null }> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (error || !data) return { player: null, error: 'Invalid credentials.' }
  if (data.password_hash !== passwordHash) return { player: null, error: 'Invalid credentials.' }
  if (data.is_banned) return { player: null, error: 'This account has been banned.' }
  return { player: data as DBPlayer, error: null }
}

// ─── Save progress ────────────────────────────────────────────────────────────

export async function dbSave(
  username: string,
  data: Partial<DBPlayer>,
): Promise<void> {
  await supabase.from('players').update(data).eq('username', username.toLowerCase())
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function dbGetLeaderboard(): Promise<
  { username: string; xp: number; rebirths: number }[]
> {
  const { data } = await supabase
    .from('players')
    .select('username, xp, rebirths')
    .eq('is_banned', false)
    .order('rebirths', { ascending: false })
    .order('xp', { ascending: false })
    .limit(50)
  return (data ?? []) as { username: string; xp: number; rebirths: number }[]
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function dbGetAllPlayers(): Promise<DBPlayer[]> {
  const { data } = await supabase.from('players').select('*').order('xp', { ascending: false })
  return (data ?? []) as DBPlayer[]
}

export async function dbBanPlayer(username: string, banned: boolean): Promise<void> {
  await supabase.from('players').update({ is_banned: banned }).eq('username', username.toLowerCase())
}

export async function dbResetPlayer(username: string): Promise<void> {
  await supabase.from('players').update({
    xp: 0, gold: 50, rebirths: 0,
    inventory: [], name_tags: [], discovered_eggs: [], atk_buff: 0,
  }).eq('username', username.toLowerCase())
}

export async function dbAwardPlayer(
  username: string,
  type: 'gold' | 'xp' | 'rebirths',
  amount: number,
): Promise<void> {
  const { data } = await supabase.from('players').select(type).eq('username', username.toLowerCase()).single()
  if (!data) return
  const current = (data as Record<string, number>)[type] ?? 0
  await supabase.from('players').update({ [type]: current + amount }).eq('username', username.toLowerCase())
}

export async function dbSendGift(recipient: string, item: unknown): Promise<void> {
  await supabase.from('gifts').insert({ recipient: recipient.toLowerCase(), item, claimed: false })
}

export async function dbClaimGifts(username: string): Promise<unknown[]> {
  const { data } = await supabase
    .from('gifts')
    .select('*')
    .eq('recipient', username.toLowerCase())
    .eq('claimed', false)
  if (!data || data.length === 0) return []
  const ids = data.map((g: { id: string }) => g.id)
  await supabase.from('gifts').update({ claimed: true }).in('id', ids)
  return data.map((g: { item: unknown }) => g.item)
}

// ─── Global settings ──────────────────────────────────────────────────────────

export async function dbGetDifficulty(): Promise<number> {
  const { data } = await supabase.from('global_settings').select('value').eq('key', 'difficulty_mult').single()
  return data ? parseFloat(data.value) : 1
}

export async function dbSetDifficulty(mult: number): Promise<void> {
  await supabase.from('global_settings').update({ value: String(mult) }).eq('key', 'difficulty_mult')
}
