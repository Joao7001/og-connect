import { useState } from "react";

export function ListEditor({ label, name, initialItems, separator = ";", placeholder, maxItems }: { label: string; name: string; initialItems: string[]; separator?: string; placeholder: string; maxItems?: number }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("");
  const add = () => { const value = draft.trim(); if (!value || items.includes(value) || (maxItems && items.length >= maxItems)) return; setItems((current) => [...current, value]); setDraft(""); };
  return <label className="list-editor"><span>{label}</span><div className="list-editor-add"><input value={draft} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button type="button" onClick={add} aria-label={`Adicionar ${label}`}>+</button></div><div className="list-editor-items">{items.map((item) => <span key={item}>{item}<button type="button" onClick={() => setItems((current) => current.filter((value) => value !== item))} aria-label={`Remover ${item}`}>×</button></span>)}</div><input type="hidden" name={name} value={items.join(separator)} /></label>;
}

export function LinkListEditor({ initialItems }: { initialItems: Array<{ label: string; url: string }> }) {
  const [items, setItems] = useState(initialItems);
  const [label, setLabel] = useState(""); const [url, setUrl] = useState("");
  const add = () => { const nextLabel = label.trim(); const nextUrl = url.trim(); if (!nextLabel || !nextUrl) return; setItems((current) => [...current, { label: nextLabel, url: nextUrl }]); setLabel(""); setUrl(""); };
  return <label className="list-editor link-list-editor"><span>Links do projeto</span><div className="list-editor-add"><input value={label} placeholder="Texto do link" onChange={(event) => setLabel(event.target.value)} /><input value={url} type="url" placeholder="https://..." onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button type="button" onClick={add} aria-label="Adicionar link">+</button></div><div className="list-editor-items">{items.map((item) => <span key={`${item.label}|${item.url}`}>{item.label}<button type="button" onClick={() => setItems((current) => current.filter((value) => value !== item))} aria-label={`Remover ${item.label}`}>×</button></span>)}</div><input type="hidden" name="links" value={items.map((item) => `${item.label}|${item.url}`).join(";")} /></label>;
}
