'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type ContentItem = { id: string; title: string; slug: string; summary: string | null; body: string | null; content_type: 'story' | 'news' | 'report' | 'resource'; image_url: string | null; file_url: string | null; published_at: string | null }

export function PublicContent({ types, emptyTitle, emptyText }: { types: Array<ContentItem['content_type']>; emptyTitle: string; emptyText: string }) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) { setLoading(false); return }
      const { data, error: queryError } = await supabase.from('site_content').select('id,title,slug,summary,body,content_type,image_url,file_url,published_at').eq('published', true).in('content_type', types).order('published_at', { ascending: false })
      if (!active) return
      if (queryError) setError(true)
      else setItems((data ?? []) as ContentItem[])
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [types.join(',')])

  if (!isSupabaseConfigured) return <div className="notice" style={{marginTop:24}}>The content library will appear here after the website is connected to Supabase and approved content is published.</div>
  if (loading) return <p className="resource-status">Loading published content…</p>
  if (error) return <div className="notice" style={{marginTop:24}}>Published content could not be loaded. Check the Supabase schema and public read policy.</div>
  if (!items.length) return <div className="resource-status" style={{marginTop:24}}><strong>{emptyTitle}</strong><p>{emptyText}</p></div>
  return <div className="cards" style={{marginTop:28}}>{items.map(item => <article className="card" key={item.id}>{item.image_url && <img src={item.image_url} alt="" style={{width:'100%',height:190,objectFit:'cover',borderRadius:10,marginBottom:18}}/>}<span className="tag">{item.content_type.toUpperCase()}{item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}` : ''}</span><h3>{item.title}</h3>{item.summary && <p>{item.summary}</p>}{item.body && <details><summary style={{color:'var(--green)',fontWeight:700,cursor:'pointer'}}>Read more</summary><p style={{whiteSpace:'pre-line'}}>{item.body}</p></details>}{item.file_url && <p><a href={item.file_url} target="_blank" rel="noreferrer" style={{color:'var(--green)',fontWeight:800}}>Open / download resource ↗</a></p>}</article>)}</div>
}
