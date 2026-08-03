import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, type ApiRecord } from "../api";
import { SectionHeading } from "../components/public/Shared";

export function NewsPage() {
  const [filter, setFilter] = useState("Todos"); const [articles, setArticles] = useState<ApiRecord[]>([]);
  useEffect(() => { api.list("articles").then(setArticles).catch(() => setArticles([])); }, []);
  const categories = ["Todos", ...Array.from(new Set(articles.map((article) => String(article.category ?? "Geral")).filter(Boolean)))];
  const visible = articles.filter((article) => filter === "Todos" || String(article.category ?? "Geral") === filter);
  const featured = visible.find((article) => article.featured === true) ?? visible[0];
  const date = (article: ApiRecord) => new Date(String(article.publishedAt ?? article.createdAt ?? Date.now())).toLocaleDateString("pt-BR");
  return <section className="container page"><SectionHeading eyebrow="NOTÍCIAS" title="O que está rolando" text="Atualizações reais dos nossos servidores, creators e campeonatos." /><div className="filters">{categories.map((category) => <button onClick={() => setFilter(category)} className={filter === category ? "selected" : ""} key={category}>{category}</button>)}</div>{featured && <article className="featured-news" style={typeof featured.coverUrl === "string" ? { backgroundImage: `linear-gradient(90deg, #151b2af2, #151b2a88), url(${featured.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><div><span>DESTAQUE · {String(featured.category ?? "Geral")}</span><h2>{String(featured.title ?? "Matéria")}</h2><p>{String(featured.excerpt ?? "")}</p><Link to={`/noticias/${String(featured.slug ?? featured._id)}`}>Ler matéria <ArrowRight /></Link></div><Trophy /></article>}<div className="articles">{visible.filter((article) => article._id !== featured?._id).map((article) => <Link className="article-link" key={article._id} to={`/noticias/${String(article.slug ?? article._id)}`}><article><span>{String(article.category ?? "Geral")}</span><h3>{String(article.title ?? "Matéria")}</h3><p>{String(article.excerpt ?? "")}</p><time>{date(article)}</time><ArrowRight /></article></Link>)}{!visible.length && <p>Nenhuma matéria publicada ainda.</p>}</div></section>;
}

export function ArticlePage() {
  const { id } = useParams(); const [article, setArticle] = useState<ApiRecord | null>(null);
  useEffect(() => { api.list("articles").then((items) => setArticle(items.find((item) => String(item.slug ?? item._id) === id) ?? null)).catch(() => setArticle(null)); }, [id]);
  if (!article) return <section className="container page"><p>Matéria não encontrada.</p></section>;
  const published = new Date(String(article.publishedAt ?? article.createdAt ?? Date.now())).toLocaleDateString("pt-BR");
  return <article className="container page article-page"><Link className="article-back" to="/noticias"><ArrowLeft size={16} /> Voltar para notícias</Link>{typeof article.coverUrl === "string" && <img className="article-page-cover" src={article.coverUrl} alt="" />}<span>{String(article.category ?? "Geral")} · {published}</span><h1>{String(article.title ?? "Matéria")}</h1>{String(article.excerpt ?? "").trim() && <p className="article-page-lead">{String(article.excerpt)}</p>}<div className="article-page-content">{String(article.content ?? article.excerpt ?? "").split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>;
}
