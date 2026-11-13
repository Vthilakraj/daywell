export const STORAGE_KEY = 'daywell:v1';
export const categories = ['Personal', 'Work', 'Study', 'Wellbeing'] as const;
export type Category = typeof categories[number];
export type Task = { id: string; title: string; date: string; category: Category; done: boolean; priority: boolean };
export type Routine = { id: string; title: string; days: string[] };
export type Entry = { mood: string; win: string; tomorrow: string };
export type Timer = { duration: number; remaining: number; endAt: number | null; mode: 'focus' | 'break'; creditedDate: string | null };
export type Data = { version: 1; name: string; tasks: Task[]; routines: Routine[]; journal: Record<string, Entry>; focus: Record<string, number>; timer: Timer };
export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function fromKey(key: string) { return new Date(`${key}T12:00:00`); }
export function shiftDate(key: string, offset: number) { const d = fromKey(key); d.setDate(d.getDate() + offset); return dateKey(d); }
export function weekDates(key: string) { const d = fromKey(key); const monday = shiftDate(key, -((d.getDay() + 6) % 7)); return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i)); }
export function makeTimer(minutes = 25, mode: Timer['mode'] = 'focus'): Timer { return { duration: minutes * 60, remaining: minutes * 60, endAt: null, mode, creditedDate: null }; }
export function freshData(): Data { return { version: 1, name: '', tasks: [], routines: [], journal: {}, focus: {}, timer: makeTimer() }; }
export function secondsLeft(timer: Timer, now = Date.now()) { return timer.endAt === null ? timer.remaining : Math.max(0, Math.ceil((timer.endAt - now) / 1000)); }
export function finishTimer(data: Data, now = Date.now()): Data {
  if (data.timer.endAt === null || secondsLeft(data.timer, now) > 0) return data;
  const date = data.timer.creditedDate || dateKey();
  return { ...data, focus: data.timer.mode === 'focus' ? { ...data.focus, [date]: (data.focus[date] || 0) + data.timer.duration / 60 } : data.focus, timer: { ...makeTimer(data.timer.duration / 60, data.timer.mode), remaining: 0 } };
}
const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(fromKey(value).getTime()) && dateKey(fromKey(value)) === value;
const text = (v: unknown, max = 5000): v is string => typeof v === 'string' && v.length <= max;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function parseBackup(raw: string): Data {
  if (raw.length > 2_000_000) throw new Error('Please choose a backup smaller than 2 MB.');
  const d = JSON.parse(raw);
  if (!record(d) || d.version !== 1 || !text(d.name, 40) || !Array.isArray(d.tasks) || !Array.isArray(d.routines) || !record(d.journal) || !record(d.focus)) throw new Error('This file is not a valid Daywell backup.');
  if (d.tasks.length > 10000 || d.routines.length > 100) throw new Error('This backup has too many items.');
  const ids = new Set<string>();
  for (const t of d.tasks) {
    if (!record(t) || !text(t.id, 100) || !t.id || ids.has(t.id) || !text(t.title, 200) || !t.title.trim() || !validDate(t.date) || !categories.includes(t.category as Category) || typeof t.done !== 'boolean' || typeof t.priority !== 'boolean') throw new Error('The backup contains an invalid task.');
    ids.add(t.id);
  }
  ids.clear();
  for (const r of d.routines) {
    if (!record(r) || !text(r.id, 100) || !r.id || ids.has(r.id) || !text(r.title, 100) || !r.title.trim() || !Array.isArray(r.days) || !r.days.every(validDate)) throw new Error('The backup contains an invalid routine.');
    ids.add(r.id);
  }
  for (const [k, e] of Object.entries(d.journal)) if (!validDate(k) || !record(e) || !['', 'low', 'okay', 'good', 'great'].includes(e.mood as string) || !text(e.win) || !text(e.tomorrow)) throw new Error('The backup contains an invalid reflection.');
  for (const [k, n] of Object.entries(d.focus)) if (!validDate(k) || typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1_000_000) throw new Error('The backup contains invalid focus time.');
  // A backup restores plans, never a running timer from another device.
  return { version: 1, name: d.name, tasks: d.tasks as Task[], routines: d.routines as Routine[], journal: d.journal as Record<string, Entry>, focus: d.focus as Record<string, number>, timer: makeTimer() };
}
export function loadData(): { data: Data; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: freshData(), warning: '' };
    const parsed = parseBackup(raw);
    const saved = JSON.parse(raw).timer;
    if (saved && Number.isFinite(saved.duration) && saved.duration >= 60 && saved.duration <= 10800 && Number.isFinite(saved.remaining) && saved.remaining >= 0 && saved.remaining <= saved.duration && (saved.endAt === null || Number.isFinite(saved.endAt)) && ['focus', 'break'].includes(saved.mode) && (saved.creditedDate === null || validDate(saved.creditedDate))) parsed.timer = saved;
    return { data: finishTimer(parsed), warning: '' };
  } catch { return { data: freshData(), warning: 'Saved data could not be loaded. The stored copy stays unchanged until you edit. Restore a backup from Settings if you have one.' }; }
}
export const templates: { title: string; tag: string; description: string; category: Category; tasks: string[]; color: string; icon: string }[] = [
  { title: 'A calmer morning', tag: 'START FRESH', description: 'A little breathing room before the day begins.', category: 'Wellbeing', tasks: ['Drink a glass of water', 'Take 5 minutes to stretch', 'Choose one thing that matters today'], color: 'peach', icon: 'sun' },
  { title: 'Find your study flow', tag: 'MAKE PROGRESS', description: 'Less overwhelm. One focused session at a time.', category: 'Study', tasks: ['Pick one topic to work on', 'Complete a 25-minute focus session', 'Write down 3 things you learned'], color: 'lavender', icon: 'book' },
  { title: 'The weekly reset', tag: 'CLEAR SOME SPACE', description: 'Close the tabs in your head. Start lighter.', category: 'Personal', tasks: ['Tidy one small space', 'Review next week’s commitments', 'Plan something to look forward to'], color: 'lime', icon: 'leaf' },
  { title: 'A focused workday', tag: 'ONE THING AT A TIME', description: 'Turn a big to-do list into a doable day.', category: 'Work', tasks: ['Choose your most important task', 'Protect a distraction-free work block', 'Write tomorrow’s first step'], color: 'blue', icon: 'work' }
];
