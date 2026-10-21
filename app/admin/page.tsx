'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut, Plus, RefreshCw, Save, Trash2, ExternalLink } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

type ContentType = 'story' | 'report' | 'news' | 'resource'
type Entry = {
  id: string; title: string; slug: string; summary: string | null; body: string | null
  content_type: ContentType; image_url: string | null; file_url: string | null
  published: boolean; published_at: string | null; created_at: string
}
type Draft = Omit<Entry, 'id' | 'created_at' | 'published_at'> & { id?: string }
const emptyDraft: Draft = { title: '', slug: '', summary: '', body: '', content_type: 'story', image_url: '', file_url: '', published: false }

export default function AdminPage() {
  const [authSession, setAuthSession] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editorOpen, setEditorOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | ContentType>('all')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    if (!supabase || !session) return
    setBusy(true)
    const { data, error } = await supabase.from('site_content').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setEntries((data ?? []) as Entry[])
    setBusy(false)
  }, [session])

  // Keep the raw Supabase session separate from the verified admin session.
  // A valid login alone is not enough: the UID must be approved in site_admins.
  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    let active = true
    const applyAuthSession = (nextSession: any) => {
      if (!active) return
      setAuthSession(nextSession)
      if (!nextSession) {
        setSession(null)
        setChecking(false)
      } else {
        setChecking(true)
      }
    }
    void supabase.auth.getSession().then(({ data }) => applyAuthSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applyAuthSession(nextSession)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  
  useEffect(() => {
    const client = supabase

    if (!client || !authSession) {
      setSession(null)
      setChecking(false)
      return
    }

    let active = true

    const verifyApprovedUid = async () => {
      const { data, error } = await client.rpc('is_site_admin')

      if (!active) return

      if (error || data !== true) {
        setSession(null)
        setMessage(
          'Access denied: this account is not an approved FLAT administrator. Contact the site owner if you need access.'
        )
        setChecking(false)

        await client.auth.signOut()
        return
      }

      setSession(authSession)
      setMessage('')
      setChecking(false)
    }

    setChecking(true)
    void verifyApprovedUid()

    return () => {
      active = false
    }
  }, [authSession])


  useEffect(() => { if (session) void refresh() }, [session, refresh])

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('')
    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setMessage(error.message)
    // On success, the auth listener updates authSession and the UID allowlist
    // check above decides whether this account receives the admin dashboard.
  }

  const saveEntry = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    if (!draft.title.trim()) { setMessage('Title is required.'); return }
    const slug = draft.slug.trim() || draft.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setBusy(true); setMessage('')
    const payload = { ...draft, slug, summary: draft.summary || null, body: draft.body || null, image_url: draft.image_url || null, file_url: draft.file_url || null, published_at: draft.published ? new Date().toISOString() : null }
    const result = draft.id
      ? await supabase.from('site_content').update(payload).eq('id', draft.id)
      : await supabase.from('site_content').insert(payload)
    setBusy(false)
    if (result.error) { setMessage(result.error.message); return }
    setMessage('Saved successfully.')
    setDraft(emptyDraft)
    setEditorOpen(false)
    await refresh()
  }

  const deleteEntry = async (entry: Entry) => {
    if (!supabase || !window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return
    setBusy(true)
    const { error } = await supabase.from('site_content').delete().eq('id', entry.id)
    setBusy(false)
    if (error) setMessage(error.message)
    else { setMessage('Entry deleted.'); if (draft.id === entry.id) { setDraft(emptyDraft); setEditorOpen(false) }; await refresh() }
  }

  const signOut = async () => { await supabase?.auth.signOut(); setEntries([]); setDraft(emptyDraft) }
  const edit = (entry: Entry) => { setDraft({ id: entry.id, title: entry.title, slug: entry.slug, summary: entry.summary ?? '', body: entry.body ?? '', content_type: entry.content_type, image_url: entry.image_url ?? '', file_url: entry.file_url ?? '', published: entry.published }); setEditorOpen(true); setMessage('') }

  if (!isSupabaseConfigured) return <div className="admin-shell"><div className="admin-card"><span className="eyebrow">FLAT WEBSITE ADMIN</span><h1>Connect Supabase</h1><p>The admin panel is ready, but Supabase credentials are not configured in this local project.</p><ol><li>Copy <code>.env.example</code> to <code>.env.local</code>.</li><li>Add your Supabase Project URL and anon/public key.</li><li>Run the SQL in <code>supabase/schema.sql</code> in Supabase SQL Editor.</li><li>Restart the dev server.</li></ol><p className="admin-help">Never put a service-role key in a <code>NEXT_PUBLIC_</code> variable or in frontend code.</p><Link className="btn btn-primary" href="/">Return to website</Link></div></div>

  if (checking) return <div className="admin-shell"><div className="admin-card">Checking admin session…</div></div>
  if (!session) return <div className="admin-shell"><form className="admin-card admin-login" onSubmit={signIn}><span className="eyebrow">FLAT / NUNTAM KAILAWN</span><h1>Admin sign in</h1><p>Sign in with an approved FLAT administrator account. Your Supabase user ID must be listed in the site_admins table.</p><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>{message && <p className="admin-message" role="status">{message}</p>}<button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><Link className="admin-back" href="/">← Back to website</Link></form></div>

  const shown = entries.filter(entry => filter === 'all' || entry.content_type === filter)
  return <div className="admin-shell admin-dashboard"><header className="admin-top"><div><span className="eyebrow">FLAT WEBSITE CMS</span><h1>Content dashboard</h1><p>Signed in as {session.user?.email}</p></div><div className="admin-top-actions"><Link className="btn admin-light-btn" href="/" target="_blank">View website <ExternalLink size={15}/></Link><button className="btn admin-light-btn" onClick={signOut}><LogOut size={15}/> Sign out</button></div></header>
    {message && <p className="admin-message" role="status">{message}</p>}
    <div className="admin-layout"><section className="admin-card"><div className="admin-card-heading"><div><span className="eyebrow">CONTENT LIBRARY</span><h2>Stories, news & reports</h2></div><button type="button" className="btn admin-light-btn" onClick={() => { setDraft({ ...emptyDraft }); setMessage(''); setEditorOpen(true) }}><Plus size={16}/> New entry</button></div><div className="admin-filters"><label>Filter<select value={filter} onChange={e => setFilter(e.target.value as any)}><option value="all">All content</option><option value="story">Stories</option><option value="news">News</option><option value="report">Reports</option><option value="resource">Resources</option></select></label><button className="icon-btn" title="Refresh content" onClick={() => void refresh()}><RefreshCw size={16}/></button></div><div className="admin-entry-list">{shown.length === 0 && <p className="admin-empty">No entries yet. Create your first entry using the form.</p>}{shown.map(entry => <article className="admin-entry" key={entry.id}><div><span className="admin-entry-type">{entry.content_type} · {entry.published ? 'Published' : 'Draft'}</span><h3>{entry.title}</h3><p>{entry.summary || 'No summary added.'}</p><small>/{entry.slug}</small></div><div className="admin-entry-actions"><button className="icon-btn" title="Edit" onClick={() => edit(entry)}><Save size={16}/></button><button className="icon-btn danger" title="Delete" onClick={() => void deleteEntry(entry)}><Trash2 size={16}/></button></div></article>)}</div></section>
    {editorOpen && <form className="admin-card admin-editor" onSubmit={saveEntry}><span className="eyebrow">{draft.id ? 'EDIT ENTRY' : 'NEW ENTRY'}</span><h2>{draft.id ? 'Update content' : 'Create content'}</h2><label>Content type<select value={draft.content_type} onChange={e => setDraft({ ...draft, content_type: e.target.value as ContentType })}><option value="story">Story</option><option value="news">News</option><option value="report">Report / Annual report</option><option value="resource">Resource</option></select></label><label>Title<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value, slug: draft.id ? draft.slug : '' })} required /></label><label>URL slug<input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} placeholder="auto-generated-from-title" /></label><label>Short summary<textarea rows={3} value={draft.summary ?? ''} onChange={e => setDraft({ ...draft, summary: e.target.value })} /></label><label>Body / description<textarea rows={7} value={draft.body ?? ''} onChange={e => setDraft({ ...draft, body: e.target.value })} placeholder="Plain text content for this entry" /></label><label>Image URL (optional)<input type="url" value={draft.image_url ?? ''} onChange={e => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://…" /></label><label>Report / resource file URL (optional)<input type="url" value={draft.file_url ?? ''} onChange={e => setDraft({ ...draft, file_url: e.target.value })} placeholder="https://…" /></label><label className="admin-checkbox"><input type="checkbox" checked={draft.published} onChange={e => setDraft({ ...draft, published: e.target.checked })}/> Publish this entry</label><div className="admin-form-actions"><button className="btn btn-primary" disabled={busy}><Save size={16}/>{busy ? 'Saving…' : 'Save entry'}</button><button type="button" className="btn admin-light-btn" onClick={() => { setDraft({ ...emptyDraft }); setEditorOpen(false); setMessage('') }}>Cancel</button></div><p className="admin-help">Published content can be made visible on public pages once the CMS display is connected. Only verified, approved content should be published.</p></form>}</div>
  </div>
}
