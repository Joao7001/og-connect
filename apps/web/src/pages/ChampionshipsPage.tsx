import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api, type ApiRecord } from "../api";
import { SectionHeading } from "../components/public/Shared";

export default function ChampionshipsPage() {
  const [seasons, setSeasons] = useState<ApiRecord[]>([]);
  useEffect(() => { void api.list("seasons").then(setSeasons).catch(() => setSeasons([])); }, []);
  const statusLabel = (status: unknown) => status === "active" ? "Em andamento" : status === "completed" ? "Encerrado" : "Em breve";
  return <section className="container page championships-index"><SectionHeading eyebrow="CAMPEONATOS" title="Acompanhe as competições" text="Escolha um campeonato para ver classificação, rodada e próximas partidas." /><div className="championships-index-grid">{seasons.map((item) => <Link className="championship-select-card" to={`/campeonatos/${String(item._id)}`} key={String(item._id)} style={typeof item.imageUrl === "string" && item.imageUrl ? { backgroundImage: `linear-gradient(90deg, #161b2eee 15%, #11182799 58%, #11182722), url(${item.imageUrl})` } : undefined}><span className={`championship-state ${String(item.status ?? "upcoming")}`}>{statusLabel(item.status)}</span><h2>{String(item.name ?? "Campeonato")}</h2><p>Temporada {String(item.number ?? "—")} · {String(item.currentRound ?? "Rodada em breve")}</p><ArrowRight /></Link>)}</div>{!seasons.length && <p className="empty-state">Nenhum campeonato foi cadastrado ainda.</p>}</section>;
}
