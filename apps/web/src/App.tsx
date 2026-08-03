import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronRight,
  CirclePlay,
  Gamepad2,
  Menu,
  MessageCircle,
  Search,
  Shield,
  Trophy,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api, type AdminResource, type ApiRecord } from "./api";
import { externalUrl, projectExternalLink } from "./lib/links";
import { SettingsManager } from "./components/admin/SettingsManager";
import { LinkListEditor, ListEditor } from "./components/admin/ListEditors";
import { RoleBadge, roleLabels } from "./components/public/Shared";
import TeamPage from "./pages/TeamPage";
import LiveChannelsPage from "./pages/LiveChannelsPage";
import ChampionshipsPage from "./pages/ChampionshipsPage";
import { ArticlePage as PublicArticlePage, NewsPage } from "./pages/NewsPage";

type Member = {
  id: string;
  name: string;
  handle: string;
  role: string;
  color: string;
  initials: string;
  description: string;
  specialty: string;
  socials: Array<string | { network: string; url: string }>;
  imageUrl?: string;
};
const members: Member[] = [];
const demoMembers: Member[] = [
  {
    id: "kai",
    name: "Kai Oliveira",
    handle: "@kaioliveira",
    role: "Fundador & streamer",
    color: "#4F46E5",
    initials: "KO",
    description:
      "Criador, estrategista e anfitrião das noites mais caóticas do servidor.",
    specialty: "Minecraft & comunidade",
    socials: ["YouTube", "Twitch", "Instagram", "Discord"],
  },
  {
    id: "luna",
    name: "Luna Martins",
    handle: "@lunamartins",
    role: "Direção criativa",
    color: "#3B82F6",
    initials: "LM",
    description:
      "Transforma ideias de jogo em histórias que a comunidade quer acompanhar.",
    specialty: "Arte & vídeos",
    socials: ["YouTube", "TikTok", "Instagram"],
  },
  {
    id: "niko",
    name: "Niko Reis",
    handle: "@nikoreis",
    role: "Competitivo",
    color: "#22C55E",
    initials: "NR",
    description:
      "Especialista em Cobblemon e responsável pelas análises do campeonato.",
    specialty: "Cobblemon & e-sports",
    socials: ["Twitch", "YouTube", "Twitter/X"],
  },
  {
    id: "mari",
    name: "Mari Lopes",
    handle: "@marilopes",
    role: "Community manager",
    color: "#F59E0B",
    initials: "ML",
    description:
      "A ponte entre cada criador, projeto e pessoa que chega para jogar.",
    specialty: "Eventos & Discord",
    socials: ["Instagram", "Discord", "TikTok"],
  },
];
const projects: string[][] = [];
const demoProjects = [
  [
    "Servidor Minecraft",
    "Online",
    "Um mundo vivo para construir, explorar e criar histórias juntos.",
    "Java • Velocity • Docker",
    "#22C55E",
  ],
  [
    "Liga Cobblemon",
    "Temporada 03",
    "O campeonato que transforma estratégia, monotypes e rivalidade em espetáculo.",
    "Cobblemon • API • Discord",
    "#4F46E5",
  ],
  [
    "Central Discord",
    "2.4 mil online",
    "Canais, eventos e uma comunidade que não para.",
    "Discord.js • MongoDB",
    "#3B82F6",
  ],
  [
    "Servidor CS2",
    "Em manutenção",
    "Partidas organizadas para quem joga em equipe.",
    "SteamCMD • Linux",
    "#F59E0B",
  ],
];
const news: Array<[string, string, string]> = [];
const demoNews = [
  ["Cobblemon Championship: semifinais definidas", "Campeonato", "12 ago 2026"],
  ["Nova temporada do servidor começa nesta sexta", "Minecraft", "09 ago 2026"],
  ["Conheça os novos criadores do grupo", "Comunidade", "04 ago 2026"],
];
const nav = [
  ["Início", "/"],
  ["Equipe", "/equipe"],
  ["Ao vivo", "/ao-vivo"],
  ["Campeonatos", "/campeonatos"],
  ["Notícias", "/noticias"],
];
const pokemonTypes: Record<
  string,
  { color: string; emoji: string; label: string }
> = {
  Fire: { color: "#F97316", emoji: "🔥", label: "Fire" },
  Water: { color: "#0EA5E9", emoji: "💧", label: "Water" },
  Grass: { color: "#22C55E", emoji: "🌿", label: "Grass" },
  Electric: { color: "#FACC15", emoji: "⚡", label: "Electric" },
  Ghost: { color: "#7C3AED", emoji: "👻", label: "Ghost" },
  Dark: { color: "#374151", emoji: "🌑", label: "Dark" },
  Ice: { color: "#67E8F9", emoji: "❄", label: "Ice" },
  Rock: { color: "#A16207", emoji: "🪨", label: "Rock" },
  Bug: { color: "#84CC16", emoji: "🦋", label: "Bug" },
  Poison: { color: "#A855F7", emoji: "☠", label: "Poison" },
  Fairy: { color: "#F472B6", emoji: "🌸", label: "Fairy" },
  Psychic: { color: "#EC4899", emoji: "🧠", label: "Psychic" },
  Fighting: { color: "#DC2626", emoji: "🥊", label: "Fighting" },
  Dragon: { color: "#2563EB", emoji: "🐉", label: "Dragon" },
  Ground: { color: "#CA8A04", emoji: "🌎", label: "Ground" },
  Flying: { color: "#818CF8", emoji: "🦅", label: "Flying" },
  Steel: { color: "#94A3B8", emoji: "⚙", label: "Steel" },
  Normal: { color: "#A1A1AA", emoji: "", label: "Normal" },
  Fogo: { color: "#F97316", emoji: "🔥", label: "Fire" },
  Água: { color: "#0EA5E9", emoji: "💧", label: "Water" },
  Grama: { color: "#22C55E", emoji: "🌿", label: "Grass" },
  Elétrico: { color: "#FACC15", emoji: "⚡", label: "Electric" },
  Fantasma: { color: "#7C3AED", emoji: "👻", label: "Ghost" },
  Sombrio: { color: "#374151", emoji: "🌑", label: "Dark" },
  Gelo: { color: "#67E8F9", emoji: "❄", label: "Ice" },
  Pedra: { color: "#A16207", emoji: "🪨", label: "Rock" },
  Inseto: { color: "#84CC16", emoji: "🦋", label: "Bug" },
  Veneno: { color: "#A855F7", emoji: "☠", label: "Poison" },
  Fada: { color: "#F472B6", emoji: "🌸", label: "Fairy" },
  Psíquico: { color: "#EC4899", emoji: "🧠", label: "Psychic" },
  Lutador: { color: "#DC2626", emoji: "🥊", label: "Fighting" },
  Dragão: { color: "#2563EB", emoji: "🐉", label: "Dragon" },
  Terra: { color: "#CA8A04", emoji: "🌎", label: "Ground" },
  Voador: { color: "#818CF8", emoji: "🦅", label: "Flying" },
  Aço: { color: "#94A3B8", emoji: "⚙", label: "Steel" },
};
Object.assign(pokemonTypes, {
  Eletric: pokemonTypes.Electric,
  Eletrico: pokemonTypes.Electric,
  Terrestre: pokemonTypes.Ground,
});
const adminModules = {
  overview: {
    label: "Visão geral",
    title: "Visão geral",
    description: "Acompanhe o que acontece na comunidade.",
    rows: [
      ["Membros ativos", "2.481"],
      ["Projetos em andamento", "5"],
      ["Publicações no mês", "12"],
    ],
  },
  members: {
    label: "Integrantes",
    title: "Gerenciar integrantes",
    description: "Cadastre, edite e organize os criadores.",
    rows: members.map((member) => [member.name, member.role]),
  },
  projects: {
    label: "Destaques",
    title: "Configuração de destaques",
    description: "Configure os cards, imagens, botões e links exibidos na página inicial.",
    rows: projects.map((project) => [project[0], project[1]]),
  },
  championship: {
    label: "Campeonatos",
    title: "Gerenciar campeonatos",
    description: "Crie campeonatos e atualize temporadas, rodadas e partidas.",
    rows: [
      ["Temporada 03", "Semifinais"],
      ["Niko × Lumi", "16 ago · 19h"],
      ["Bia × Theo", "16 ago · 20h"],
    ],
  },
  news: {
    label: "Notícias",
    title: "Gerenciar notícias",
    description: "Crie publicações e defina destaques.",
    rows: news.map((article) => [article[0], article[1]]),
  },
  media: {
    label: "Mídias",
    title: "Biblioteca de mídias",
    description: "Organize imagens, banners e arquivos.",
    rows: [
      ["Banner — Temporada 03", "Imagem · 2,4 MB"],
      ["Capa — Minecraft", "Imagem · 1,8 MB"],
      ["Logo OG Connect", "SVG · 64 KB"],
    ],
  },
  settings: { label: "Configurações", title: "Dashboard de configurações", description: "Administre acessos, senha e redes sociais do site.", rows: [] },
} as const;

function Avatar({
  member,
  large = false,
}: {
  member: Member;
  large?: boolean;
}) {
  return (
    <div
      className={"avatar " + (large ? "avatar-large" : "")}
      style={{
        background: `linear-gradient(135deg, ${member.color}, #0D1117)`,
      }}
    >
      {member.imageUrl ? (
        <img src={member.imageUrl} alt={`Foto de ${member.name}`} />
      ) : (
        member.initials
      )}
    </div>
  );
}
function TypeBadges({ player }: { player: ApiRecord }) {
  const types = Array.isArray(player.types)
    ? player.types.map(String).slice(0, 2)
    : [String(player.monotype ?? "Normal")];
  return (
    <span className="pokemon-type-badges">
      {types.map((type) => {
        const item = pokemonTypes[type] ?? {
          color: "#64748B",
          emoji: "",
          label: type,
        };
        return (
          <i key={type} style={{ color: item.color }}>
            {item.emoji} {item.label}
          </i>
        );
      })}
    </span>
  );
}
function socialData(social: string | { network: string; url: string }) {
  return typeof social === "string" ? { network: social, url: "#" } : social;
}
function SocialIcon({ network, official = false }: { network: string; official?: boolean }) {
  const key = network
    .toLowerCase()
    .replace("twitter/x", "x")
    .replace("twitter", "x")
    .replaceAll(" ", "");
  const supported = new Set([
    "youtube", "discord", "instagram", "twitch", "tiktok", "x", "facebook", "kick",
  ]);
  return supported.has(key) ? (
    official ? (
      <span
        className={`social-icon-official ${key}`}
        role="img"
        aria-label={network}
        style={{ maskImage: `url(/icons/social/${key}.svg)`, WebkitMaskImage: `url(/icons/social/${key}.svg)` }}
      />
    ) : (
      <span
        className="social-icon"
        role="img"
        aria-label={network}
        style={{ maskImage: `url(/icons/social/${key}.svg)`, WebkitMaskImage: `url(/icons/social/${key}.svg)` }}
      />
    )
  ) : <span className="social-icon-fallback">{network.slice(0, 1)}</span>;
}
function Brand() {
  return <><span className="brand-mark"><img src="/images/og-mark.svg" alt="" /></span><span className="brand-word">CONNECT</span></>;
}
function memberFromApi(record: ApiRecord, index = 0): Member {
  const name = String(record.name ?? "Criador");
  return {
    id: String(record.slug ?? record._id),
    name,
    handle: `@${String(record.slug ?? "grupo").replaceAll("-", "")}`,
    role: String(record.role ?? record.specialty ?? "Integrante"),
    color: ["#4F46E5", "#3B82F6", "#22C55E", "#F59E0B"][index % 4],
    initials: name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    description: String(record.description ?? ""),
    specialty: String(record.specialty ?? ""),
    socials: Array.isArray(record.socials)
      ? record.socials.map((social) =>
          typeof social === "object" && social !== null && "network" in social
            ? {
                network: String((social as { network: unknown }).network),
                url: String((social as { url?: unknown }).url ?? "#"),
              }
            : String(social),
        )
      : [],
    imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : undefined,
  };
}
function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
function AppShell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && (
        <>
          <header>
            <Link className="brand" to="/">
              <Brand />
            </Link>
            <nav>
              {nav.map(([label, path]) => (
                <NavLink key={path} to={path} end={path === "/"}>
                  {label}
                </NavLink>
              ))}
            </nav>
            <Link className="join" to="/admin">
              <Shield size={15} /> Área admin
            </Link>
            <button
              className="menu-button"
              onClick={() => setMenu(true)}
              aria-label="Abrir menu"
            >
              <Menu />
            </button>
          </header>
          <AnimatePresence>
            {menu && (
              <motion.div
                className="mobile-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button onClick={() => setMenu(false)}>
                  <X />
                </button>
                {nav.map(([label, path]) => (
                  <Link onClick={() => setMenu(false)} key={path} to={path}>
                    {label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      <main key={location.pathname}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
function HomeTemplate() {
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [projectRecords, setProjectRecords] = useState<ApiRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<ApiRecord>({ _id: "", socials: [] });
  useEffect(() => {
    api
      .siteSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);
  useEffect(() => { void api.siteSettings().then(setSiteSettings).catch(() => undefined); }, []);
  const siteSocials = Array.isArray(siteSettings.socials)
    ? siteSettings.socials.filter((social): social is ApiRecord => typeof social === "object" && social !== null && Boolean((social as ApiRecord).url))
    : [];
  useEffect(() => {
    api
      .list("projects")
      .then(setProjectRecords)
      .catch(() => setProjectRecords([]));
  }, []);
  const highlights = [
    ["CAMPEONATO COBBLEMON", "Ver Campeonato", "/campeonato", "#7C3AED"],
    ["SERVIDOR MINECRAFT", "Ver Servidor", "/projetos", "#0EA5E9"],
    ["DISCORD DA COMUNIDADE", "Entrar no Discord", "/projetos", "#5865F2"],
    ["SERVIDOR CS2", "Ver Servidor", "/projetos", "#64748B"],
    ["ÚLTIMO VÍDEO", "Assistir Agora", "/noticias", "#A855F7"],
  ];
  const selectedProjects = projectRecords
    .filter((project) => project.featured === true)
    .sort((a, b) => Number(a.featuredOrder ?? 0) - Number(b.featuredOrder ?? 0));
  const projectHighlights = (
    selectedProjects.length ? selectedProjects : projectRecords
  )
    .slice(0, 5)
    .map((project, index) => {
      const link = projectExternalLink(project);
        const championshipId =
        typeof project.championshipId === "object" && project.championshipId !== null
          ? String((project.championshipId as ApiRecord)._id ?? "")
          : String(project.championshipId ?? "");
        const destination = championshipId ? `/campeonatos/${championshipId}` : externalUrl(link?.url) || "#destaques";
        return [
        project._id,
        String(project.name ?? "Projeto em andamento").toUpperCase(),
        String(project.ctaLabel ?? link?.label ?? "Ver projeto"),
          destination,
        ["#7C3AED", "#0EA5E9", "#5865F2", "#64748B", "#A855F7"][index],
        typeof project.imageUrl === "string" ? project.imageUrl : "",
        String(project.imagePosition ?? "50% 50%"),
      ];
    });
  const stats = [
    [summary?.members ?? 0, "integrantes"],
    [summary?.articles ?? 0, "videos publicados"],
    [summary?.projects ?? 0, "projetos ativos"],
    [summary?.seasons ?? 0, "campeonatos"],
    [summary?.players ?? 0, "jogadores"],
  ];
  return (
    <div className="home-template">
      <section className="home-template-hero">
        <div className="home-template-copy">
          <h1>
            SEJA BEM-VINDO AO
            <br />
            <i>OG CONNECT</i>
          </h1>
          <p>
            O hub oficial do Os Guridi. Um único lugar para acompanhar nossos projetos, entrar nos servidores,
            participar dos campeonatos e descobrir tudo o que a comunidade está construindo.
          </p>
          <div className="actions">
            <Link className="primary" to="/equipe">
              Conheça a Equipe <ArrowRight />
            </Link>
            <a className="secondary" href="#destaques">Ver Destaques</a>
          </div>
        </div>
      </section>
      <section className="home-highlights" id="destaques">
        <p>DESTAQUES</p>
        <div>
          {projectHighlights.map(
            ([projectId, title, action, to, color, image, imagePosition]) => (
              <a
                className="home-highlight"
                style={{
                  borderColor: color,
                  backgroundImage: image
                    ? `linear-gradient(#090b1422,#090b14aa), url(${image})`
                    : undefined,
                  backgroundPosition: imagePosition,
                }}
                href={to}
                onClick={() => void api.trackProjectVisit(projectId)}
                target={to.startsWith("http") ? "_blank" : undefined}
                rel={to.startsWith("http") ? "noreferrer" : undefined}
                key={title}
              >
                <span>{title}</span>
                <small style={{ color, borderColor: color }}>{action}</small>
              </a>
            ),
          )}
          {!projectHighlights.length && (
            <p className="home-empty">
              Cadastre projetos em andamento no painel administrativo.
            </p>
          )}
        </div>
      </section>
      <section className="home-template-numbers">
        {stats.map(([value, label]) => (
          <div key={label as string}>
            <b>{String(value)}</b>
            <span>{label}</span>
          </div>
        ))}
      </section>
      {siteSocials.length > 0 && <section className="home-socials">
        <p>NOSSAS REDES</p>
        <div>
          {siteSocials.map((social) => (
            <a key={String(social.network)} href={String(social.url)} target="_blank" rel="noreferrer"><SocialIcon network={String(social.network)} /></a>
          ))}
        </div>
      </section>}
    </div>
  );
}

function Home() {
  return <HomeTemplate />;
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    api
      .siteSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);
  const stats = [
    [String(summary?.members ?? 0), "integrantes"],
    [String(summary?.articles ?? 0), "notícias publicadas"],
    [String(summary?.projects ?? 0), "projetos ativos"],
    [String(summary?.seasons ?? 0), "campeonatos"],
  ];
  return (
    <>
      <section className="hero">
        <div className="glow glow-one" />
        <div className="glow glow-two" />
        <div className="hero-copy">
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="eyebrow"
          >
            DESDE 2021 • BRASIL
          </motion.p>
          <motion.h1
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Criamos junto.
            <br />
            <i>Jogamos além.</i>
          </motion.h1>
          <p className="lead">
            Um coletivo de criadores que transforma jogos, ideias e comunidade
            em experiências memoráveis.
          </p>
          <div className="actions">
            <Link className="primary" to="/equipe">
              Conheça a equipe <ArrowRight />
            </Link>
            <Link className="secondary" to="/campeonato">
              <Trophy /> Campeonato
            </Link>
          </div>
        </div>
        <motion.div
          className="hero-card"
          initial={{ opacity: 0, rotate: 4 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="live">
            <span /> AO VIVO
          </div>
          <Gamepad2 size={70} />
          <p>PRÓXIMO EVENTO</p>
          <h3>
            Final da Liga
            <br />
            Cobblemon
          </h3>
          <div>
            <CalendarDays size={16} /> 16 AGO • 19H
          </div>
        </motion.div>
      </section>
      <section className="numbers">
        {stats.map(([n, label]) => (
          <div key={label}>
            <b>{n}</b>
            <span>{label}</span>
          </div>
        ))}
      </section>
      <section className="container intro">
        <div>
          <SectionHeading
            eyebrow="O COLETIVO"
            title="Mais do que creators. Um time."
            text="De lives a campeonatos, reunimos pessoas que acreditam no poder de construir em comunidade."
          />
          <Link className="text-link" to="/equipe">
            Nossa história <ChevronRight />
          </Link>
        </div>
        <div className="quote">
          “O melhor conteúdo nasce quando a gente joga do nosso jeito — junto.”
          <small>— Kai Oliveira, fundador</small>
        </div>
      </section>
      <section className="container">
        <SectionHeading
          eyebrow="EM DESTAQUE"
          title="Onde a comunidade acontece."
        />
        <div className="feature-grid">
          {projects
            .slice(0, 3)
            .map(([title, status, description, tech, color], i) => (
              <motion.article
                whileHover={{ y: -7 }}
                key={title}
                className={"feature feature-" + i}
              >
                <span style={{ color }}>{status}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <small>{tech}</small>
                <ArrowRight />
              </motion.article>
            ))}
        </div>
      </section>
      <section className="container news-preview">
        <SectionHeading eyebrow="FICA POR DENTRO" title="Últimas notícias" />
        <div>
          {news.map(([title, category, date]) => (
            <Link className="news-row" to="/noticias" key={title}>
              <span>{category}</span>
              <h3>{title}</h3>
              <time>{date}</time>
              <ChevronRight />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
function LegacyTeam() {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  useEffect(() => {
    api
      .list("members")
      .then(setRecords)
      .catch(() => setRecords([]));
  }, []);
  const currentMembers = records
    .slice()
    .sort((a, b) => Number(a.displayOrder ?? Number.MAX_SAFE_INTEGER) - Number(b.displayOrder ?? Number.MAX_SAFE_INTEGER))
    .map(memberFromApi);
  return (
    <section className="container page">
      <SectionHeading
        eyebrow="PESSOAS QUE FAZEM"
        title="A nossa equipe"
        text="Cada voz, uma perspectiva. Cada criador, uma parte da história."
      />
      <div className="member-grid member-showcase">
        {currentMembers.map((m) => (
          <Link to={"/equipe/" + m.id} className="member-card" key={m.id}>
            <Avatar member={m} large />
            <h3>{m.name}</h3>
            <p>{m.role}</p>
            <div className="member-socials">
              {m.socials.slice(0, 6).map((social) => (
                <span key={socialData(social).network}>
                  <SocialIcon network={socialData(social).network} official />
                </span>
              ))}
            </div>
          </Link>
        ))}
        {!currentMembers.length && <p>Nenhum integrante cadastrado ainda.</p>}
      </div>
    </section>
  );
}
function LegacyLiveChannels() {
  const [channels, setChannels] = useState<ApiRecord[]>([]);
  useEffect(() => {
    api.liveChannels().then(setChannels).catch(() => setChannels([]));
  }, []);
  return <section className="container page live-page">
    <SectionHeading eyebrow="TRANSMISSÕES" title="Acompanhe quem está ao vivo" text="Canais da equipe cadastrados na Twitch, YouTube e Kick." />
    <div className="live-channel-grid">
      {channels.map((channel) => { const livePlatforms = Array.isArray(channel.livePlatforms) ? channel.livePlatforms.map(String) : []; const isLive = channel.isLive === true; const isMultistream = isLive && livePlatforms.length > 1; const platformClass = isMultistream ? "multistream" : String(channel.network ?? "").toLowerCase(); return <article className={`live-channel-card ${isLive ? "is-live" : "is-offline"} platform-${platformClass}`} key={channel._id}>
        {typeof channel.imageUrl === "string" ? <img src={channel.imageUrl} alt="" /> : <span className="live-channel-avatar">{String(channel.name ?? "?").slice(0, 1)}</span>}
        <div><div className="live-channel-meta"><span className={`live-status ${isLive ? "online" : "offline"}`}>{isLive ? "AO VIVO" : "OFFLINE"}</span>{isMultistream ? <span className="live-channel-platform live-multistream">MULTISTREAM {livePlatforms.map((platform) => <SocialIcon key={platform} network={platform} official />)}</span> : <span className="live-channel-platform"><SocialIcon network={String(channel.network ?? "")} official /> {String(channel.network ?? "Canal")}</span>}</div><h2>{String(channel.name ?? "Integrante")}</h2><p>{isLive && channel.streamTitle ? String(channel.streamTitle) : String(channel.role ?? "Criador")}</p></div>
        <a href={String(channel.url ?? "#")} target="_blank" rel="noreferrer"><CirclePlay size={18} /> {isLive ? "Assistir ao vivo" : "Abrir canal"}</a>
      </article>; })}
      {!channels.length && <p>Nenhum canal de transmissão foi cadastrado ainda.</p>}
    </div>
  </section>;
}
function Profile() {
  const { id } = useParams();
  const [remote, setRemote] = useState<ApiRecord | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<
    Record<string, { title: string; thumbnailUrl: string }>
  >({});
  useEffect(() => {
    api
      .list("members")
      .then((items) => {
        const index = items.findIndex((item) => item.slug === id);
        if (index >= 0) setRemote(items[index]);
      })
      .catch(() => undefined);
  }, [id]);
  const m = remote
    ? memberFromApi(remote)
    : (members.find((x) => x.id === id) ?? members[0] ?? {
        id: String(id ?? "integrante"),
        name: "Carregando perfil...",
        handle: "",
        role: "",
        color: "#7C3AED",
        initials: "OG",
        description: "",
        specialty: "",
        socials: [],
      });
  const projects = Array.isArray(remote?.projects)
    ? remote.projects.map(String)
    : [];
  const videos = Array.isArray(remote?.videos)
    ? remote.videos.filter(
        (video): video is Record<string, unknown> =>
          typeof video === "object" && video !== null,
      )
    : [];
  const videoUrls = videos
    .map((video) => String(video.url ?? ""))
    .filter(Boolean);
  useEffect(() => {
    let active = true;
    Promise.all(
      videoUrls.map(
        async (url) =>
          [
            url,
            await api
              .youtubeMetadata(url)
              .catch(() => ({ title: "", thumbnailUrl: "" })),
          ] as const,
      ),
    ).then((items) => {
      if (active) setVideoMetadata(Object.fromEntries(items));
    });
    return () => {
      active = false;
    };
  }, [remote?._id, videoUrls.join("|")]);
  return (
    <section className={"profile profile-showcase-page" + (typeof remote?.bannerUrl === "string" && remote.bannerUrl ? " has-profile-banner" : " no-profile-banner")}>
      <div
        className="profile-banner"
        style={{
          background:
            typeof remote?.bannerUrl === "string" && remote.bannerUrl
              ? `linear-gradient(90deg,#090b14cc,#090b1411), url(${remote.bannerUrl}) center/cover`
              : `linear-gradient(115deg, ${m.color}, #0d1117 75%)`,
        }}
      />
      <div className="container profile-content profile-showcase-content">
        <div className="profile-main">
          <Avatar member={m} large />
          <div>
            <h1>{m.name}</h1>
            <span className="profile-roles">
              {roleLabels(m.role).map((role) => <RoleBadge role={role} key={role} />)}
            </span>
            <p className="profile-text">
              {m.description || "Criador da OG Connect."}
            </p>
            <div className="profile-socials">
              {m.socials.map((social) => {
                const item = socialData(social);
                return (
                  <a
                    key={item.network}
                    href={item.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SocialIcon network={item.network} official />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <aside className="profile-projects">
          <p>PROJETOS EM ANDAMENTO</p>
          {projects.length ? (
            projects.map((project) => (
              <span key={project}>
                <i />
                {project}
              </span>
            ))
          ) : (
            <small>Nenhum projeto informado.</small>
          )}
        </aside>
        <section className="profile-videos">
          <div>
            <h2>Últimos vídeos</h2>
            <span>Conteúdos recentes</span>
          </div>
          <div className="video-grid">
            {videos.map((video, index) => {
              const metadata = videoMetadata[String(video.url ?? "")];
              return (
                <a
                  key={String(video.url ?? index)}
                  href={String(video.url ?? "#")}
                  className="video-card"
                  target="_blank"
                  rel="noreferrer"
                  style={
                    metadata?.thumbnailUrl ||
                    typeof video.thumbnailUrl === "string"
                      ? {
                          backgroundImage: `linear-gradient(#090b1433,#090b14cc), url(${metadata?.thumbnailUrl || video.thumbnailUrl})`,
                        }
                      : undefined
                  }
                >
                  <CirclePlay />
                  <b>
                    {metadata?.title || String(video.title ?? "Novo vídeo")}
                  </b>
                </a>
              );
            })}
            {!videos.length && <p>Nenhum vídeo cadastrado ainda.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
function Projects() {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  useEffect(() => {
    api
      .list("projects")
      .then(setRecords)
      .catch(() => setRecords([]));
  }, []);
  const projectPosition = (project: ApiRecord) => {
    const identifier = `${String(project.name ?? "")} ${String(project.slug ?? "")}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replaceAll(" ", "");
    if (identifier.includes("ultimovideo")) return 2;
    if (identifier.includes("discord")) return 1;
    return 0;
  };
  const displayedProjects = records.slice().sort((a, b) => {
    const aPosition = projectPosition(a);
    const bPosition = projectPosition(b);
    if (!aPosition && !bPosition) return 0;
    if (!aPosition) return -1;
    if (!bPosition) return 1;
    return aPosition - bPosition;
  });
  return (
    <section className="container page">
      <SectionHeading
        eyebrow="EM CONSTRUÇÃO"
        title="Projetos que nos movem"
        text="Tecnologia, criatividade e comunidade trabalhando no mesmo servidor."
      />
      <div className="projects-grid">
        {displayedProjects.map((project, index) => {
          const championshipId = typeof project.championshipId === "object" && project.championshipId !== null
            ? String((project.championshipId as ApiRecord)._id ?? "")
            : String(project.championshipId ?? "");
          const link = projectExternalLink(project);
          const actionLabel = String(project.ctaLabel ?? link?.label ?? "Ver projeto");
          return <article className="project" key={project._id}>
            <div
              className="project-art"
              style={
                typeof project.imageUrl === "string"
                  ? {
                      backgroundImage: `linear-gradient(#0d111755,#0d111755), url(${project.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: String(project.imagePosition ?? "50% 50%"),
                    }
                  : {
                      background: `linear-gradient(135deg, ${["#22C55E", "#4F46E5", "#3B82F6"][index % 3]}, #111827)`,
                    }
              }
            />
            <h3>{String(project.name ?? "Projeto")}</h3>
            {String(project.description ?? "").trim() && (
              <p>{String(project.description)}</p>
            )}
            {championshipId ? (
              <Link className="project-link project-action" to={`/campeonatos/${championshipId}`}>
                Ver campeonato <ArrowRight />
              </Link>
            ) : link ? (
              <a
                className="project-link project-action"
                href={String(link.url)}
                target="_blank"
                rel="noreferrer"
                onClick={() => void api.trackProjectVisit(project._id)}
              >
                {actionLabel} <ArrowRight />
              </a>
            ) : (
              <button className="project-action" type="button" disabled>
                {actionLabel} <ArrowRight />
              </button>
            )}
          </article>
        })}
        {!records.length && <p>Nenhum projeto cadastrado ainda.</p>}
      </div>
    </section>
  );
}
const ranking = [
  ["Niko", "9", "1", "90%"],
  ["Bia", "8", "2", "80%"],
  ["Theo", "7", "3", "70%"],
  ["Lumi", "6", "4", "60%"],
];
function Championship() {
  const [players, setPlayers] = useState<ApiRecord[]>([]);
  const [battles, setBattles] = useState<ApiRecord[]>([]);
  useEffect(() => {
    const load = () =>
      Promise.all([api.list("players"), api.list("battles")])
        .then(([playerList, battleList]) => {
          setPlayers(playerList);
          setBattles(battleList);
        })
        .catch(() => {
          setPlayers([]);
          setBattles([]);
        });
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);
  const sorted = [...players].sort(
    (a, b) =>
      Number(b.wins ?? 0) - Number(a.wins ?? 0) ||
      Number(a.losses ?? 0) - Number(b.losses ?? 0),
  );
  const winRate = (player: ApiRecord) => {
    const wins = Number(player.wins ?? 0);
    const losses = Number(player.losses ?? 0);
    return wins + losses
      ? `${Math.round((wins / (wins + losses)) * 100)}%`
      : "—";
  };
  const initials = (player: ApiRecord) =>
    String(player.name ?? "?")
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("");
  return (
    <section className="championship">
      <div className="container champ-compact">
        <header className="champ-compact-head">
          <div>
            <h1>Campeonato Cobblemon</h1>
            <span>Temporada 03</span>
          </div>
          <div className="round">
            <b>Rodada 7</b>
            <small>de 10</small>
          </div>
          <div className="champ-date">
            <CalendarDays size={14} /> 25/05/2024
          </div>
        </header>
        <div className="champ-grid">
          <section className="top-three">
            <p>TOP 3</p>
            <div className="top-three-cards">
              {sorted.slice(0, 3).map((player, index) => (
                <Link
                  to={`/campeonato/${String(player.slug ?? player._id)}`}
                  className={"compact-place compact-place-" + (index + 1)}
                  key={player._id}
                >
                  <b>{index + 1}</b>
                  <i>{initials(player)}</i>
                  <strong>{String(player.name ?? "Jogador")}</strong>
                  <span>{String(player.monotype ?? "MONOTYPE")}</span>
                  <em>
                    {Number(player.wins ?? 0)}
                    <small>VITÓRIAS</small>
                  </em>
                </Link>
              ))}
              {!sorted.length && (
                <p className="empty-compact">Cadastre jogadores no painel.</p>
              )}
            </div>
          </section>
          <section className="compact-leaderboard">
            <p>LEADERBOARD</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th>Vitórias</th>
                  <th>Derrotas</th>
                  <th>Win rate</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, index) => (
                  <tr key={player._id}>
                    <td>{index + 1}</td>
                    <td>{String(player.name ?? "Jogador")}</td>
                    <td>{Number(player.wins ?? 0)}</td>
                    <td>{Number(player.losses ?? 0)}</td>
                    <td>{winRate(player)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        <section className="player-types">
          <p>TIPOS DOS JOGADORES</p>
          <div>
            {sorted.map((player, index) => (
              <Link
                to={`/campeonato/${String(player.slug ?? player._id)}`}
                key={player._id}
                className="type-player"
              >
                <i
                  style={{
                    borderColor: [
                      "#eab308",
                      "#38bdf8",
                      "#ef4444",
                      "#60a5fa",
                      "#c084fc",
                      "#a855f7",
                    ][index % 6],
                  }}
                >
                  {initials(player)}
                </i>
                <b>{String(player.name ?? "Jogador")}</b>
                <span>{String(player.monotype ?? "MONOTYPE")}</span>
              </Link>
            ))}
          </div>
        </section>
        <SeasonDetails players={sorted} battles={battles} round="Rodada 1" />
      </div>
    </section>
  );
}
function SeasonDetails({
  players,
  battles,
  round,
}: {
  players: ApiRecord[];
  battles: ApiRecord[];
  round: string;
}) {
  const name = (value: unknown) =>
    typeof value === "object" && value !== null && "name" in value
      ? String((value as ApiRecord).name)
      : "Jogador";
  const id = (value: unknown) =>
    typeof value === "object" && value !== null && "_id" in value
      ? String((value as ApiRecord)._id)
      : String(value ?? "");
  const upcoming = battles.filter(
    (battle) =>
      battle.status !== "completed" &&
      String(battle.round ?? "Rodada 1") === round,
  );
  const completed = battles.filter((battle) => battle.status === "completed");
  const top = [...players].sort(
    (a, b) => Number(b.wins ?? 0) - Number(a.wins ?? 0),
  )[0];
  const undefeated = players.filter(
    (player) =>
      Number(player.losses ?? 0) === 0 && Number(player.wins ?? 0) > 0,
  )[0];
  const totalWins = players.reduce(
    (sum, player) => sum + Number(player.wins ?? 0),
    0,
  );
  const bestDifference = [...players].sort(
    (a, b) =>
      Number(b.wins ?? 0) -
      Number(b.losses ?? 0) -
      (Number(a.wins ?? 0) - Number(a.losses ?? 0)),
  )[0];
  return (
    <>
      <div className="champ-battle-grid">
        <section>
          <p>PRÓXIMAS BATALHAS</p>
          {upcoming.map((battle) => (
            <article key={battle._id}>
              <span>⚔</span>
              <b>
                {name(battle.playerA)} <i>vs</i> {name(battle.playerB)}
              </b>
            </article>
          ))}
          {!upcoming.length && <small>Nenhuma partida agendada.</small>}
        </section>
        <section>
          <p>ÚLTIMAS BATALHAS</p>
          {completed.map((battle) => (
            <article key={battle._id}>
              <span>🏆</span>
              <b>
                <strong className={id(battle.winner) === id(battle.playerA) ? "battle-winner" : "battle-loser"}>{name(battle.playerA)}</strong>
                <i>vs</i>
                <strong className={id(battle.winner) === id(battle.playerB) ? "battle-winner" : "battle-loser"}>{name(battle.playerB)}</strong>
              </b>
              <small>Venceu: {name(battle.winner)}</small>
            </article>
          ))}
          {!completed.length && <small>Nenhuma partida concluída.</small>}
        </section>
      </div>
      <section className="season-statistics">
        <p>ESTATÍSTICAS DA TEMPORADA</p>
        <div>
          {[
            [
              "Maior sequência",
              String(top?.wins ?? 0),
              String(top?.name ?? "—"),
            ],
            ["Mais batalhas", String(completed.length), "Liga"],
            ["Maior vencedor", String(totalWins), String(top?.name ?? "—")],
            [
              "Pokémon invicto",
              String(undefeated?.monotype ?? "—"),
              String(undefeated?.name ?? "—"),
            ],
            [
              "Maior comeback",
              String(
                Math.max(
                  0,
                  Number(bestDifference?.wins ?? 0) -
                    Number(bestDifference?.losses ?? 0),
                ),
              ),
              String(bestDifference?.name ?? "—"),
            ],
          ].map(([label, value, detail]) => (
            <article key={label}>
              <span>{label}</span>
              <b>{value}</b>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
function LegacyChampionships() {
  const [seasons, setSeasons] = useState<ApiRecord[]>([]);
  useEffect(() => {
    void api.list("seasons").then(setSeasons).catch(() => setSeasons([]));
  }, []);
  const statusLabel = (status: unknown) => {
    if (status === "active") return "Em andamento";
    if (status === "completed") return "Encerrado";
    return "Em breve";
  };
  return (
    <section className="container page championships-index">
      <SectionHeading
        eyebrow="CAMPEONATOS"
        title="Acompanhe as competições"
        text="Escolha um campeonato para ver classificação, rodada e próximas partidas."
      />
      <div className="championships-index-grid">
        {seasons.map((item) => (
          <Link
            className="championship-select-card"
            to={`/campeonatos/${String(item._id)}`}
            key={String(item._id)}
            style={typeof item.imageUrl === "string" && item.imageUrl ? { backgroundImage: `linear-gradient(90deg, #161b2e 20%, #111827aa 58%, #11182722), url(${item.imageUrl})` } : undefined}
          >
            <span className={`championship-state ${String(item.status ?? "upcoming")}`}>
              {statusLabel(item.status)}
            </span>
            <h2>{String(item.name ?? "Campeonato")}</h2>
            <p>
              Temporada {String(item.number ?? "—")} · {String(item.currentRound ?? "Rodada em breve")}
            </p>
            <ArrowRight />
          </Link>
        ))}
      </div>
      {!seasons.length && (
        <p className="empty-state">Nenhum campeonato foi cadastrado ainda.</p>
      )}
    </section>
  );
}

function ChampionshipLive() {
  const { id: seasonId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<ApiRecord[]>([]);
  const [battles, setBattles] = useState<ApiRecord[]>([]);
  const [memberRecords, setMemberRecords] = useState<ApiRecord[]>([]);
  const [season, setSeason] = useState<ApiRecord | null>(null);
  useEffect(() => {
    const load = () =>
      Promise.all([
        api.list("players"),
        api.list("battles"),
        api.currentSeason(),
        api.list("seasons"),
        api.list("members"),
      ]).then(([playerList, battleList, currentSeason, seasons, members]) => {
        setPlayers(playerList);
        setBattles(battleList);
        setMemberRecords(members);
        setSeason(
          seasonId
            ? seasons.find((item) => String(item._id) === seasonId) ?? currentSeason
            : currentSeason,
        );
      });
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [seasonId]);
  const sorted = [...players].sort(
    (a, b) =>
      Number(b.wins ?? 0) - Number(a.wins ?? 0) ||
      Number(a.losses ?? 0) - Number(b.losses ?? 0),
  );
  const seasonBattles = season
    ? battles.filter((battle) => {
        const linkedSeason =
          typeof battle.seasonId === "object" && battle.seasonId !== null
            ? String((battle.seasonId as ApiRecord)._id ?? "")
            : String(battle.seasonId ?? "");
        return linkedSeason === String(season._id);
      })
    : battles;
  const legacyBattles = battles.filter((battle) => !battle.seasonId);
  const displayedBattles = season?.status === "active"
    ? [...seasonBattles, ...legacyBattles.filter((battle) => !seasonBattles.includes(battle))]
    : seasonBattles.length ? seasonBattles : battles;
  const memberForPlayer = (player: ApiRecord) => {
    const playerId = String(player.memberId ?? "");
    const playerSlug = String(player.slug ?? "").toLowerCase();
    const playerName = String(player.name ?? "").trim().toLowerCase();
    return memberRecords.find(
      (member) =>
        String(member._id) === playerId ||
        String(member.slug ?? "").toLowerCase() === playerSlug ||
        String(member.name ?? "").trim().toLowerCase() === playerName,
    );
  };
  const primaryTypeColor = (player: ApiRecord) => {
    const first = Array.isArray(player.types)
      ? String(player.types[0] ?? "Normal")
      : String(player.monotype ?? "Normal");
    return pokemonTypes[first]?.color ?? String(player.color ?? "#64748B");
  };
  const initials = (player: ApiRecord) =>
    String(player.name ?? "?")
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("");
  const rate = (player: ApiRecord) => {
    const total = Number(player.wins ?? 0) + Number(player.losses ?? 0);
    return total
      ? `${Math.round((Number(player.wins ?? 0) / total) * 100)}%`
      : "—";
  };
  return (
    <section className="championship">
      <div className="container champ-compact">
        <header className="champ-compact-head">
          <div>
            <h1>{String(season?.name ?? "Campeonato")}</h1>
          </div>
          <div className="round">
            <b className="season-badge">Temporada {String(season?.number ?? "03")}</b>
            <small>temporada ativa</small>
          </div>
          <div className="champ-date champ-round-box">
            {String(season?.currentRound ?? "Rodada 1")}
          </div>
        </header>
        <div className="champ-grid">
          <section className="top-three">
            <p>TOP 3</p>
            <div className="top-three-cards">
              {sorted.slice(0, 3).map((player, index) => (
                <div
                  className={"compact-place compact-place-" + (index + 1) + (memberForPlayer(player) ? " member-player-card" : "")}
                  style={{ background: `linear-gradient(145deg, ${primaryTypeColor(player)}3b, #111827 74%)`, border: `1px solid ${primaryTypeColor(player)}` }}
                  onClick={() => {
                    const member = memberForPlayer(player);
                    if (member) navigate(`/equipe/${String(member.slug ?? member._id)}`);
                  }}
                  key={player._id}
                >
                  <b>{index + 1}</b>
                  <i style={{ borderColor: primaryTypeColor(player) }}>
                    {typeof memberForPlayer(player)?.imageUrl === "string" ? <img src={String(memberForPlayer(player)?.imageUrl)} alt="" /> : initials(player)}
                  </i>
                  <strong>{String(player.name)}</strong>
                  <TypeBadges player={player} />
                  <em>
                    {Number(player.wins ?? 0)}
                    <small>VITÓRIAS</small>
                  </em>
                </div>
              ))}
            </div>
          </section>
          <section className="compact-leaderboard">
            <p>LEADERBOARD</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th>Vitórias</th>
                  <th>Derrotas</th>
                  <th>Win rate</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, index) => (
                  <tr key={player._id}>
                    <td>{index + 1}</td>
                    <td>{String(player.name)}</td>
                    <td>{Number(player.wins ?? 0)}</td>
                    <td>{Number(player.losses ?? 0)}</td>
                    <td>{rate(player)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        <section className="player-types">
          <p>TIPOS DOS JOGADORES</p>
          <div>
            {sorted.map((player, index) => (
              <div
                key={player._id}
                className={"type-player" + (memberForPlayer(player) ? " member-player-card" : "")}
                style={{ background: `linear-gradient(145deg, ${primaryTypeColor(player)}38, #111827 72%)`, borderColor: `${primaryTypeColor(player)}88` }}
                onClick={() => {
                  const member = memberForPlayer(player);
                  if (member) navigate(`/equipe/${String(member.slug ?? member._id)}`);
                }}
              >
                <i
                  style={{
                    borderColor: primaryTypeColor(player),
                  }}
                >
                  {typeof memberForPlayer(player)?.imageUrl === "string" ? <img src={String(memberForPlayer(player)?.imageUrl)} alt="" /> : initials(player)}
                </i>
                <b>{String(player.name)}</b>
                <TypeBadges player={player} />
              </div>
            ))}
          </div>
        </section>
        <SeasonDetails
          players={sorted}
          battles={displayedBattles}
          round={String(season?.currentRound ?? "Rodada 1")}
        />
      </div>
    </section>
  );
}
function News() {
  const [filter, setFilter] = useState("Todos");
  return (
    <section className="container page">
      <SectionHeading
        eyebrow="NOTÍCIAS"
        title="O que está rolando"
        text="Atualizações dos nossos servidores, creators e campeonatos."
      />
      <div className="filters">
        {["Todos", "Comunidade", "Minecraft", "Campeonato"].map((x) => (
          <button
            onClick={() => setFilter(x)}
            className={filter === x ? "selected" : ""}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <article className="featured-news">
        <div>
          <span>DESTAQUE</span>
          <h2>Cobblemon Championship entra na reta final</h2>
          <p>
            Confira os classificados, os confrontos e tudo que vem por aí na
            nossa maior temporada.
          </p>
          <Link to="/campeonato">
            Ler matéria <ArrowRight />
          </Link>
        </div>
        <Trophy />
      </article>
      <div className="articles">
        {news.map(([title, category, date]) => (
          <article key={title}>
            <span>{category}</span>
            <h3>{title}</h3>
            <time>{date}</time>
            <ArrowRight />
          </article>
        ))}
      </div>
    </section>
  );
}
function LegacyNewsLive() {
  const [filter, setFilter] = useState("Todos");
  const [articles, setArticles] = useState<ApiRecord[]>([]);
  useEffect(() => {
    api.list("articles").then(setArticles).catch(() => setArticles([]));
  }, []);
  const categories = ["Todos", ...Array.from(new Set(articles.map((article) => String(article.category ?? "Geral")).filter(Boolean)))];
  const visibleArticles = articles.filter((article) => filter === "Todos" || String(article.category ?? "Geral") === filter);
  const featuredArticle = visibleArticles.find((article) => article.featured === true) ?? visibleArticles[0];
  const articleDate = (article: ApiRecord) => new Date(String(article.publishedAt ?? article.createdAt ?? Date.now())).toLocaleDateString("pt-BR");
  return (
    <section className="container page">
      <SectionHeading eyebrow="NOTÍCIAS" title="O que está rolando" text="Atualizações reais dos nossos servidores, creators e campeonatos." />
      <div className="filters">
        {categories.map((category) => <button onClick={() => setFilter(category)} className={filter === category ? "selected" : ""} key={category}>{category}</button>)}
      </div>
      {featuredArticle && (
        <article className="featured-news" style={typeof featuredArticle.coverUrl === "string" ? { backgroundImage: `linear-gradient(90deg, #151b2af2, #151b2a88), url(${featuredArticle.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
          <div>
            <span>DESTAQUE · {String(featuredArticle.category ?? "Geral")}</span>
            <h2>{String(featuredArticle.title ?? "Matéria")}</h2>
            <p>{String(featuredArticle.excerpt ?? "")}</p>
            <Link to={`/noticias/${String(featuredArticle.slug ?? featuredArticle._id)}`}>Ler matéria <ArrowRight /></Link>
          </div>
          <Trophy />
        </article>
      )}
      <div className="articles">
        {visibleArticles.filter((article) => article._id !== featuredArticle?._id).map((article) => (
          <Link className="article-link" key={article._id} to={`/noticias/${String(article.slug ?? article._id)}`}>
            <article>
              <span>{String(article.category ?? "Geral")}</span>
              <h3>{String(article.title ?? "Matéria")}</h3>
              <p>{String(article.excerpt ?? "")}</p>
              <time>{articleDate(article)}</time>
              <ArrowRight />
            </article>
          </Link>
        ))}
        {!visibleArticles.length && <p>Nenhuma matéria publicada ainda.</p>}
      </div>
    </section>
  );
}
function LegacyArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<ApiRecord | null>(null);
  useEffect(() => {
    api.list("articles").then((items) => setArticle(items.find((item) => String(item.slug ?? item._id) === id) ?? null)).catch(() => setArticle(null));
  }, [id]);
  if (!article) return <section className="container page"><p>Matéria não encontrada.</p></section>;
  const published = new Date(String(article.publishedAt ?? article.createdAt ?? Date.now())).toLocaleDateString("pt-BR");
  return <article className="container page article-page">
    <Link className="article-back" to="/noticias"><ArrowLeft size={16} /> Voltar para notícias</Link>
    {typeof article.coverUrl === "string" && <img className="article-page-cover" src={article.coverUrl} alt="" />}
    <span>{String(article.category ?? "Geral")} · {published}</span>
    <h1>{String(article.title ?? "Matéria")}</h1>
    {String(article.excerpt ?? "").trim() && <p className="article-page-lead">{String(article.excerpt)}</p>}
    <div className="article-page-content">{String(article.content ?? article.excerpt ?? "").split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
  </article>;
}
function Calendar() {
  const events = [
    ["16 AGO", "Final da Liga Cobblemon", "19:00"],
    ["21 AGO", "Live coletiva — Minecraft", "20:30"],
    ["28 AGO", "Noite de CS2", "21:00"],
  ];
  return (
    <section className="container page">
      <SectionHeading
        eyebrow="AGENDA"
        title="Marca na agenda"
        text="Eventos para jogar, assistir e encontrar a comunidade."
      />
      <div className="calendar-layout">
        <div className="calendar-card">
          <div className="calendar-head">
            <button>‹</button>
            <h3>Agosto 2026</h3>
            <button>›</button>
          </div>
          <div className="week">
            {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((x) => (
              <b key={x}>{x}</b>
            ))}
            {Array.from({ length: 31 }, (_, i) => (
              <span
                className={[16, 21, 28].includes(i + 1) ? "event-day" : ""}
                key={i}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="event-list">
          {events.map(([date, title, time]) => (
            <article key={title}>
              <b>{date}</b>
              <div>
                <h3>{title}</h3>
                <p>{time} · Discord Grupo+</p>
              </div>
              <ChevronRight />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function SearchPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      query
        ? [
            ...members.map((m) => ({
              type: "Criador",
              title: m.name,
              to: "/equipe/" + m.id,
            })),
            ...news.map((n) => ({
              type: "Notícia",
              title: n[0],
              to: "/noticias",
            })),
          ].filter((x) => x.title.toLowerCase().includes(query.toLowerCase()))
        : [],
    [query],
  );
  return (
    <section className="container page search-page">
      <SectionHeading eyebrow="PESQUISA" title="Encontre no OG" />
      <div className="search-input">
        <Search />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque criadores, projetos e notícias"
        />
      </div>
      {query && (
        <div className="search-results">
          {results.length ? (
            results.map((x) => (
              <Link key={x.title} to={x.to}>
                <span>{x.type}</span>
                <h3>{x.title}</h3>
                <ChevronRight />
              </Link>
            ))
          ) : (
            <p>Nenhum resultado encontrado.</p>
          )}
        </div>
      )}
    </section>
  );
}
function SearchLive() {
  const [query, setQuery] = useState("");
  const [remoteMembers, setRemoteMembers] = useState<ApiRecord[]>([]);
  const [remoteArticles, setRemoteArticles] = useState<ApiRecord[]>([]);
  useEffect(() => {
    void api.list("members").then(setRemoteMembers).catch(() => setRemoteMembers([]));
    void api.list("articles").then(setRemoteArticles).catch(() => setRemoteArticles([]));
  }, []);
  const results = useMemo(() => query ? [
    ...remoteMembers.map((member) => ({ type: "Criador", title: String(member.name ?? "Integrante"), to: `/equipe/${String(member.slug ?? member._id)}` })),
    ...remoteArticles.map((article) => ({ type: "Notícia", title: String(article.title ?? "Matéria"), to: `/noticias/${String(article.slug ?? article._id)}` })),
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase())) : [], [query, remoteMembers, remoteArticles]);
  return <section className="container page search-page">
    <SectionHeading eyebrow="PESQUISA" title="Encontre no OG" />
    <div className="search-input"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque integrantes e matérias" /></div>
    {query && <div className="search-results">{results.length ? results.map((item) => <Link key={`${item.type}-${item.title}`} to={item.to}><span>{item.type}</span><h3>{item.title}</h3><ChevronRight /></Link>) : <p>Nenhum resultado encontrado.</p>}</div>}
  </section>;
}
function RoundManager({ token, season, onSaved }: { token: string; season: ApiRecord | null; onSaved: () => void }) {
  const [round, setRound] = useState("Rodada 1");
  const [message, setMessage] = useState("");
  const setSeason = (_value: ApiRecord | null) => undefined;
  useEffect(() => setRound(String(season?.currentRound ?? "Rodada 1")), [season?._id, season?.currentRound]);

  useEffect(() => {
    api
      .list("seasons")
      .then((seasons) => {
        const active =
          seasons.find((item) => item.status === "active") ??
          seasons[0] ??
          null;
        setSeason(active);
        setRound(String(season?.currentRound ?? "Rodada 1"));
      })
      .catch(() => setMessage("Não foi possível carregar a temporada."));
  }, []);

  const save = async () => {
    try {
      const values = {
        name: String(season?.name ?? "Novo campeonato"),
        number: Number(season?.number ?? 1),
        status: String(season?.status ?? "active"),
        currentRound: round,
      };
      if (!season) return setMessage("Selecione um campeonato para editar.");
      await api.update("seasons", season._id, values, token);
      onSaved();
      setMessage("Rodada ativa atualizada.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a rodada.",
      );
    }
  };

  return (
    <section className="round-manager">
      <div>
        <h2>Rodada em atualização</h2>
        <p>
          Essa escolha aparece automaticamente na página pública do campeonato.
        </p>
      </div>
      <label>
        Rodada atual
        <select
          value={round}
          onChange={(event) => setRound(event.target.value)}
        >
          {[...Array(10)].map((_, index) => (
            <option key={index} value={`Rodada ${index + 1}`}>
              Rodada {index + 1}
            </option>
          ))}
          <option value="Semifinais">Semifinais</option>
          <option value="Final">Final</option>
        </select>
      </label>
      <button className="primary" onClick={save}>
        Atualizar rodada
      </button>
      {message && <small>{message}</small>}
    </section>
  );
}

function BattleManager({ token, onCreateSeason }: { token: string; onCreateSeason: () => void }) {
  const [players, setPlayers] = useState<ApiRecord[]>([]);
  const [battles, setBattles] = useState<ApiRecord[]>([]);
  const [seasons, setSeasons] = useState<ApiRecord[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [message, setMessage] = useState("");
  const load = () =>
    Promise.all([api.list("players"), api.list("battles"), api.list("seasons")])
      .then(([playerList, battleList, seasonList]) => {
        setPlayers(playerList);
        setBattles(battleList);
        setSeasons(seasonList);
        setSelectedSeasonId("");
      })
      .catch((error) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as partidas.",
        ),
      );
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, []);
  const playerName = (value: unknown) =>
    typeof value === "object" && value !== null && "name" in value
      ? String((value as ApiRecord).name)
      : "Jogador";
  const playerId = (value: unknown) =>
    typeof value === "object" && value !== null && "_id" in value
      ? String((value as ApiRecord)._id)
      : String(value ?? "");
  const roundOptions = [
    ...Array.from({ length: 10 }, (_, index) => `Rodada ${index + 1}`),
    "Oitavas de final", "Quartas de final", "Semifinais", "Final",
  ];
  const selectedSeason = seasons.find((season) => String(season._id) === selectedSeasonId) ?? null;
  const schedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.playerA === values.playerB)
      return setMessage("Escolha jogadores diferentes.");
    try {
      await api.create(
        "battles",
        { ...values, seasonId: selectedSeason?._id, status: "scheduled" },
        token,
      );
      event.currentTarget.reset();
      setMessage("Partida agendada com sucesso.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível agendar a partida.",
      );
    }
  };
  const addPlayer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const types = String(values.types ?? "").split(",").map((type) => type.trim()).filter(Boolean).slice(0, 2);
    try {
      const saved = await api.create("players", { ...values, types, monotype: types[0] ?? "Normal", wins: 0, losses: 0 }, token);
      setPlayers((current) => [...current, saved]);
      setShowPlayerForm(false);
      setMessage("Participante adicionado ao campeonato.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar o participante.");
    }
  };
  const removePlayer = async (player: ApiRecord) => {
    if (!confirm(`Remover ${String(player.name)} da lista de participantes?`)) return;
    try {
      await api.remove("players", player._id, token);
      setPlayers((current) => current.filter((item) => item._id !== player._id));
      setMessage("Participante removido.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o participante.");
    }
  };
  const remove = async (battle: ApiRecord) => {
    if (!confirm("Excluir esta partida?")) return;
    try {
      await api.remove("battles", battle._id, token);
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a partida.",
      );
    }
  };
  const finish = async (battle: ApiRecord, winner: string) => {
    if (!winner) return setMessage("Selecione o vencedor antes de concluir.");
    try {
      await api.update("battles", battle._id, { winner, status: "completed" }, token);
      setMessage("Resultado registrado e classificação atualizada.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível registrar o resultado.");
    }
  };
  const resetResult = async (battle: ApiRecord) => {
    if (!confirm("Desfazer este resultado e devolver a partida para a rodada?")) return;
    try {
      await api.update("battles", battle._id, { status: "scheduled", winner: null, playedAt: null }, token);
      setMessage("Resultado desfeito e classificação corrigida.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível desfazer o resultado.");
    }
  };
  const battleSeasonId = (battle: ApiRecord) =>
    typeof battle.seasonId === "object" && battle.seasonId !== null
      ? String((battle.seasonId as ApiRecord)._id ?? "")
      : String(battle.seasonId ?? "");
  const selectedBattles = battles.filter(
    (battle) => battleSeasonId(battle) === selectedSeasonId,
  );
  // Partidas criadas antes do seletor não tinham o campeonato gravado em todos os casos.
  // Enquanto houver apenas uma temporada, elas pertencem a ela e continuam editáveis.
  const legacyBattles = battles.filter((battle) => !battleSeasonId(battle));
  const visibleBattles = selectedSeason?.status === "active"
    ? [...selectedBattles, ...legacyBattles.filter((battle) => !selectedBattles.includes(battle))]
    : selectedBattles.length || seasons.length > 1 ? selectedBattles : battles;
  const futureBattles = visibleBattles.filter(
    (battle) => battle.status !== "completed",
  );
  const battlesByRound = futureBattles.reduce<Record<string, ApiRecord[]>>((groups, battle) => {
    const round = String(battle.round ?? "Rodada 1");
    (groups[round] ??= []).push(battle);
    return groups;
  }, {});
  return (
    <>
      <section className="championship-editor-select">
        <div>
          <span>CAMPEONATO EM EDIÇÃO</span>
          <select value={selectedSeasonId} onChange={(event) => setSelectedSeasonId(event.target.value)}>
            <option value="">Selecione um campeonato</option>
            {seasons.map((season) => (
              <option key={season._id} value={String(season._id)}>{String(season.name ?? "Campeonato")} · Temporada {String(season.number ?? "")}</option>
            ))}
          </select>
        </div>
        <button className="primary" onClick={onCreateSeason}>Adicionar campeonato</button>
      </section>
      <RoundManager token={token} season={selectedSeason} onSaved={() => void load()} />
      <section className="championship-participants">
        <div className="championship-participants-head">
          <div><h2>Participantes</h2><p>Jogadores disponíveis para as partidas deste campeonato.</p></div>
          <button className="secondary" onClick={() => setShowPlayerForm(true)}>+ Adicionar participante</button>
        </div>
        <div className="participant-mini-list">
          {players.map((player) => (
            <div key={player._id}>
              <b>{String(player.name)}</b>
              <span>{Array.isArray(player.types) ? player.types.slice(0, 2).join(" · ") : String(player.monotype ?? "Normal")}</span>
              <button onClick={() => void removePlayer(player)}>Remover</button>
            </div>
          ))}
          {!players.length && <p>Nenhum participante cadastrado.</p>}
        </div>
      </section>
      <section className="battle-manager">
        <h2>Próximas partidas</h2>
        <p>Agende confrontos; a página pública é atualizada automaticamente.</p>
        {message && <div className="admin-notice">{message}</div>}
        <form className="battle-form" onSubmit={schedule}>
          <label>
            Jogador A
            <select name="playerA" required>
              <option value="">Selecione</option>
              {players.map((player) => (
                <option key={player._id} value={player._id}>
                  {String(player.name)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Jogador B
            <select name="playerB" required>
              <option value="">Selecione</option>
              {players.map((player) => (
                <option key={player._id} value={player._id}>
                  {String(player.name)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rodada
            <select name="round" defaultValue="Rodada 1">
              {roundOptions.map((round) => (
                <option key={round} value={round}>{round}</option>
              ))}
            </select>
          </label>
          <button className="primary">
            Agendar <ArrowRight />
          </button>
        </form>
        <div className="battle-rounds">
          {Object.entries(battlesByRound).map(([round, roundBattles]) => (
            <section className="battle-round-group" key={round}>
              <h3>{round}</h3>
              {roundBattles.map((battle) => (
                <div className="battle-result-row" key={battle._id}>
                  <b>{playerName(battle.playerA)} × {playerName(battle.playerB)}</b>
                  <select defaultValue="" onChange={(event) => void finish(battle, event.target.value)}>
                    <option value="">Selecionar vencedor</option>
                    <option value={playerId(battle.playerA)}>{playerName(battle.playerA)}</option>
                    <option value={playerId(battle.playerB)}>{playerName(battle.playerB)}</option>
                  </select>
                  <button onClick={() => remove(battle)}>Excluir</button>
                </div>
              ))}
            </section>
          ))}
          {!futureBattles.length && <p>Nenhuma partida futura agendada.</p>}
        </div>
        <section className="completed-battles-manager">
          <h3>Últimas batalhas</h3>
          {visibleBattles.filter((battle) => battle.status === "completed").map((battle) => (
            <div className="completed-battle-row" key={battle._id}>
              <b>{playerName(battle.playerA)} × {playerName(battle.playerB)}</b>
              <span>Vencedor: {playerName(battle.winner)}</span>
              <button onClick={() => void resetResult(battle)}>Desfazer resultado</button>
            </div>
          ))}
          {!visibleBattles.some((battle) => battle.status === "completed") && <p>Nenhum resultado registrado.</p>}
        </section>
        <div className="admin-table legacy-battle-table">
          <div className="admin-table-head">
            <span>Confronto</span>
            <span>Data</span>
            <span>Ações</span>
          </div>
          {battles
            .filter((battle) => battle.status !== "completed")
            .map((battle) => (
              <div className="admin-table-row" key={battle._id}>
                <b>
                  {playerName(battle.playerA)} × {playerName(battle.playerB)}
                </b>
                <span>
                  {battle.scheduledAt
                    ? new Date(String(battle.scheduledAt)).toLocaleString(
                        "pt-BR",
                      )
                    : "Sem data"}
                </span>
                <div>
                  <button onClick={() => remove(battle)}>Excluir</button>
                </div>
              </div>
            ))}
          {!battles.filter((battle) => battle.status !== "completed")
            .length && (
            <div className="admin-table-row">
              Nenhuma partida futura agendada.
            </div>
          )}
        </div>
      </section>
      {showPlayerForm && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <form className="admin-form" onSubmit={addPlayer}>
            <h2>Adicionar participante</h2>
            <label>Nome<input name="name" required /></label>
            <label>Identificador<input name="slug" placeholder="ex.: joao" required /></label>
            <label>Tipos Pokémon (até 2, separados por vírgula)<input name="types" placeholder="Fire, Ghost" required /></label>
            <div className="admin-form-actions">
              <button className="primary">Adicionar <ArrowRight /></button>
              <button type="button" onClick={() => setShowPlayerForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function LegacySettingsManager({ token }: { token: string }) {
  const [settings, setSettings] = useState<ApiRecord>({ _id: "", name: "OG Connect", socials: [] });
  const [users, setUsers] = useState<ApiRecord[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { void Promise.all([api.siteSettings(), api.adminUsers(token)]).then(([data, admins]) => { setSettings(data); setUsers(admins); }); }, [token]);
  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
    const socials = ["YouTube", "Discord", "Instagram", "Twitch", "TikTok", "X", "Facebook", "Kick"].map((network) => ({ network, url: String(values[`social_${network}`] ?? "") })).filter((item) => item.url);
    setSettings(await api.updateSiteSettings({ name: values.name, description: values.description, siteUrl: values.siteUrl, socials }, token)); setMessage("Configurações salvas.");
  };
  return <section className="settings-dashboard">
    {message && <div className="admin-notice">{message}</div>}
    <form className="settings-card" onSubmit={saveSettings}><h2>Informações e redes</h2><label>Nome da plataforma<input name="name" defaultValue={String(settings.name ?? "OG Connect")} /></label><label>Descrição<input name="description" defaultValue={String(settings.description ?? "")} /></label><label>URL do site<input name="siteUrl" defaultValue={String(settings.siteUrl ?? "")} /></label>{["YouTube","Discord","Instagram","Twitch","TikTok","X","Facebook","Kick"].map((network) => <label key={network}>{network}<input name={`social_${network}`} defaultValue={String((Array.isArray(settings.socials) ? settings.socials.find((x) => typeof x === "object" && x !== null && String((x as ApiRecord).network) === network) as ApiRecord | undefined : undefined)?.url ?? "")} placeholder="https://..." /></label>)}<button className="primary">Salvar alterações</button></form>
    <section className="settings-card"><h2>Administradores</h2>{users.map((user) => <p key={user._id}>{String(user.email)}</p>)}<form onSubmit={async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const user = await api.createAdmin(String(values.email), String(values.password), token); setUsers((items) => [user, ...items]); event.currentTarget.reset(); }}><input name="email" type="email" placeholder="novo@admin.com" required /><input name="password" type="password" placeholder="Senha (mín. 6)" required /><button className="secondary">Criar administrador</button></form></section>
    <section className="settings-card"><h2>Alterar minha senha</h2><form onSubmit={async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await api.changePassword(String(values.currentPassword), String(values.newPassword), token); event.currentTarget.reset(); setMessage("Senha atualizada."); }}><input name="currentPassword" type="password" placeholder="Senha atual" required /><input name="newPassword" type="password" placeholder="Nova senha (mín. 6)" required /><button className="secondary">Alterar senha</button></form></section>
  </section>;
}
function LegacyListEditor({ label, name, initialItems, separator = ";", placeholder, maxItems }: { label: string; name: string; initialItems: string[]; separator?: string; placeholder: string; maxItems?: number }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (!value || items.includes(value) || (maxItems && items.length >= maxItems)) return;
    setItems((current) => [...current, value]); setDraft("");
  };
  return <label className="list-editor"><span>{label}</span><div className="list-editor-add"><input value={draft} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button type="button" onClick={add} aria-label={`Adicionar ${label}`}>+</button></div><div className="list-editor-items">{items.map((item) => <span key={item}>{item}<button type="button" onClick={() => setItems((current) => current.filter((value) => value !== item))} aria-label={`Remover ${item}`}>×</button></span>)}</div><input type="hidden" name={name} value={items.join(separator)} /></label>;
}
function LegacyLinkListEditor({ initialItems }: { initialItems: Array<{ label: string; url: string }> }) {
  const [items, setItems] = useState(initialItems);
  const [label, setLabel] = useState(""); const [url, setUrl] = useState("");
  const add = () => { const nextLabel = label.trim(); const nextUrl = url.trim(); if (!nextLabel || !nextUrl) return; setItems((current) => [...current, { label: nextLabel, url: nextUrl }]); setLabel(""); setUrl(""); };
  return <label className="list-editor link-list-editor"><span>Links do projeto</span><div className="list-editor-add"><input value={label} placeholder="Texto do link" onChange={(event) => setLabel(event.target.value)} /><input value={url} type="url" placeholder="https://..." onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button type="button" onClick={add} aria-label="Adicionar link">+</button></div><div className="list-editor-items">{items.map((item) => <span key={`${item.label}|${item.url}`}>{item.label}<button type="button" onClick={() => setItems((current) => current.filter((value) => value !== item))} aria-label={`Remover ${item.label}`}>×</button></span>)}</div><input type="hidden" name="links" value={items.map((item) => `${item.label}|${item.url}`).join(";")} /></label>;
}
function Admin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
    sessionStorage.getItem("adminToken") ?? "",
  );
  const [section, setSection] = useState<keyof typeof adminModules>("overview");
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [overview, setOverview] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [projectPreviewName, setProjectPreviewName] = useState("Título do destaque");
  const [projectPreviewAction, setProjectPreviewAction] = useState("Ver projeto");
  const [uploading, setUploading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRole, setMemberRole] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatus, setProjectStatus] = useState("all");
  const [draggedProjectId, setDraggedProjectId] = useState("");
  const [draggedMemberId, setDraggedMemberId] = useState("");
  const [availableSeasons, setAvailableSeasons] = useState<ApiRecord[]>([]);
  const [seasonStatus, setSeasonStatus] = useState("upcoming");
  const socialNetworks = [
    "YouTube",
    "Discord",
    "Instagram",
    "Twitch",
    "TikTok",
    "X",
    "Facebook",
    "Kick",
  ];
  useEffect(() => {
    if (token) void api.list("seasons").then(setAvailableSeasons).catch(() => setAvailableSeasons([]));
  }, [token]);
  const module = adminModules[section];
  const resource =
    section === "overview" || section === "settings"
      ? undefined
      : ((
          {
            members: "members",
            projects: "projects",
            championship: "seasons",
            news: "articles",
            media: "media",
          } as const
        )[section] as AdminResource);
  const fields: Record<AdminResource, Array<[string, string, string]>> = {
    members: [
      ["name", "Nome", "text"],
      ["slug", "Identificador", "text"],
      ["role", "Cargo no grupo", "text"],
      ["description", "Descrição", "textarea"],
      ["socials", "Redes sociais", "socials"],
      ["imageUrl", "URL da imagem", "url"],
      ["bannerUrl", "URL do banner", "url"],
      ["projects", "Projetos em andamento (separados por vírgula)", "text"],
      ["videos", "Vídeos do YouTube (links separados por ;)", "video-links"],
    ],
    projects: [
      ["name", "Nome", "text"],
      ["slug", "Identificador", "text"],
      ["status", "Status", "text"],
      ["description", "Descrição", "text"],
      ["imageUrl", "URL da imagem", "url"],
      ["links", "Links (Rótulo|URL, separados por ;)", "text"],
      ["ctaLabel", "Texto do botão de destaque", "text"],
      ["featured", "Exibir como destaque na página inicial", "checkbox"],
    ],
    players: [
      ["name", "Nome", "text"],
      ["slug", "Identificador", "text"],
      ["types", "Tipos (até 2, separados por vírgula)", "text"],
      ["wins", "Vitórias", "number"],
      ["losses", "Derrotas", "number"],
    ],
    articles: [
      ["title", "Título", "text"],
      ["slug", "Identificador", "text"],
      ["category", "Categoria", "text"],
      ["excerpt", "Resumo", "textarea"],
      ["content", "Conteúdo da matéria", "textarea"],
      ["coverUrl", "Imagem de capa", "url"],
      ["publishedAt", "Data de publicação", "date"],
      ["featured", "Exibir como matéria em destaque", "checkbox"],
    ],
    media: [
      ["name", "Nome", "text"],
      ["url", "URL do arquivo", "url"],
      ["type", "Tipo", "text"],
      ["alt", "Texto alternativo", "text"],
    ],
    battles: [],
    seasons: [
      ["name", "Nome do campeonato", "text"],
      ["number", "Temporada", "number"],
      ["status", "Status", "season-status"],
      ["currentRound", "Rodada atual", "text"],
      ["imageUrl", "Imagem lateral do card", "url"],
      ["startsAt", "Data de início", "date"],
      ["endsAt", "Data de término", "date"],
    ],
  };
  const memberRoles = Array.from(
    new Set(
      records.map((member) => String(member.role ?? "Membro")).filter(Boolean),
    ),
  );
  const visibleMembers = records.filter((member) => {
    const query = memberSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [member.name, member.role, member.specialty].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    return (
      matchesSearch &&
      (memberRole === "all" || String(member.role ?? "Membro") === memberRole)
    );
  });
  const orderedMembers = records
    .slice()
    .sort((a, b) => Number(a.displayOrder ?? Number.MAX_SAFE_INTEGER) - Number(b.displayOrder ?? Number.MAX_SAFE_INTEGER));
  const reorderMembers = async (targetId: string, sourceId = draggedMemberId) => {
    if (!sourceId || sourceId === targetId) return;
    const from = orderedMembers.findIndex((member) => member._id === sourceId);
    const to = orderedMembers.findIndex((member) => member._id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...orderedMembers];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const orderById = new Map(reordered.map((member, index) => [member._id, index + 1]));
    setRecords((current) => current.map((member) =>
      orderById.has(member._id) ? { ...member, displayOrder: orderById.get(member._id) } : member,
    ));
    setDraggedMemberId("");
    try {
      await Promise.all(reordered.map((member, index) =>
        api.update("members", member._id, { displayOrder: index + 1 }, token),
      ));
      setNotice("Ordem da equipe atualizada.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível ordenar a equipe.");
    }
  };
  const memberFormValue = (key: string) => {
    if (key === "socials" && Array.isArray(editing?.socials)) {
      return editing.socials
        .map((social) =>
          typeof social === "object" && social !== null
            ? `${String((social as Record<string, unknown>).network ?? "")}|${String((social as Record<string, unknown>).url ?? "")}`
            : String(social),
        )
        .filter(Boolean)
        .join(", ");
    }
    if (key === "projects" && Array.isArray(editing?.projects))
      return editing.projects.map(String).join(", ");
    if (key === "videos" && Array.isArray(editing?.videos))
      return editing.videos
        .map((video) =>
          typeof video === "object" && video !== null
            ? String((video as Record<string, unknown>).url ?? "")
            : "",
        )
        .filter(Boolean)
        .join("; ");
    return String(editing?.[key] ?? "");
  };
  const projectStatuses = Array.from(
    new Set(records.map((project) => String(project.status ?? "Em andamento"))),
  );
  const visibleProjects = records.filter((project) => {
    const query = projectSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [project.name, project.status, project.description].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    return (
      matchesSearch &&
      (projectStatus === "all" ||
        String(project.status ?? "Em andamento") === projectStatus)
    );
  });
  const featuredProjects = records
    .filter((project) => project.featured === true)
    .sort((a, b) => Number(a.featuredOrder ?? 0) - Number(b.featuredOrder ?? 0));
  const reorderHighlights = async (targetId: string, sourceId = draggedProjectId) => {
    if (!sourceId || sourceId === targetId) return;
    const highlighted = records
      .filter((project) => project.featured === true)
      .sort((a, b) => Number(a.featuredOrder ?? 0) - Number(b.featuredOrder ?? 0));
    const from = highlighted.findIndex((project) => project._id === sourceId);
    const to = highlighted.findIndex((project) => project._id === targetId);
    if (from < 0 || to < 0) return;
    const ordered = [...highlighted];
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    const orderById = new Map(ordered.map((project, index) => [project._id, index + 1]));
    setRecords((current) => current.map((project) =>
      orderById.has(project._id) ? { ...project, featuredOrder: orderById.get(project._id) } : project,
    ));
    setDraggedProjectId("");
    try {
      await Promise.all(ordered.map((project, index) =>
        api.update("projects", project._id, { featuredOrder: index + 1 }, token),
      ));
      setNotice("Ordem dos destaques atualizada.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível ordenar os destaques.");
    }
  };
  const overviewDays = Array.isArray(overview.activityByDay)
    ? (overview.activityByDay as Array<{ label: string; value: number }>)
    : [];
  const chartDays = overviewDays.length ? overviewDays : ["ter", "qua", "qui", "sex", "sáb", "dom", "seg"].map((label) => ({ label, value: 0 }));
  const chartMax = Math.max(4, ...chartDays.map((day) => day.value));
  const chartPoints = chartDays.map((day, index) => `${(index / Math.max(1, chartDays.length - 1)) * 100},${88 - (day.value / chartMax) * 52}`).join(" ");
  const overviewActivities = Array.isArray(overview.activities)
    ? (overview.activities as Array<{
        type: string;
        title: string;
        createdAt?: string;
      }>)
    : [];
  const overviewNetworks = Array.isArray(overview.networks)
    ? (overview.networks as Array<{ name: string; value: number }>)
    : [];
  const overviewProjects = Array.isArray(overview.topProjects)
    ? (overview.topProjects as Array<{ name: string; clicks: number }>)
    : [];
  const memberSocialUrl = (network: string) => {
    const item = Array.isArray(editing?.socials)
      ? editing.socials.find(
          (social) =>
            typeof social === "object" &&
            social !== null &&
            String(
              (social as Record<string, unknown>).network ?? "",
            ).toLowerCase() === network.toLowerCase(),
        )
      : undefined;
    return item && typeof item === "object"
      ? String((item as Record<string, unknown>).url ?? "")
      : "";
  };
  useEffect(() => {
    if (!token) return;
    setError("");
    if (section === "overview") {
      api
        .overview(token)
        .then(setOverview)
        .catch((error) => setError(error.message));
      return;
    }
    if (resource) {
      setLoading(true);
      api
        .list(resource)
        .then(setRecords)
        .catch((error) => setError(error.message))
        .finally(() => setLoading(false));
    }
  }, [section, resource, token]);
  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const result = await api.login(email, password);
      sessionStorage.setItem("adminToken", result.token);
      setToken(result.token);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível entrar.",
      );
    }
  };
  const uploadImage = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const result = await api.uploadImage(file, token);
      setImageUrl(result.url);
      setNotice("Imagem enviada com sucesso.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
    }
  };
  const submitRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resource) return;
    const values: Record<string, unknown> = Object.fromEntries(
      new FormData(event.currentTarget),
    );
    ["wins", "losses"].forEach((key) => {
      if (typeof values[key] === "string" && values[key] !== "")
        values[key] = Number(values[key]);
    });
    if (resource === "players" && typeof values.types === "string") {
      values.types = values.types
        .split(",")
        .map((type) => type.trim())
        .filter(Boolean)
        .slice(0, 2);
      values.monotype = (values.types as string[])[0] ?? "";
    }
    if (resource === "members") {
      values.socials = socialNetworks
        .map((network) => {
          const key = `social_${network.toLowerCase()}`;
          const url = String(values[key] ?? "").trim();
          delete values[key];
          return { network, url };
        })
        .filter((social) => social.url);
    }
    if (resource === "members" && typeof values.projects === "string") {
      values.projects = values.projects
        .split(",")
        .map((project) => project.trim())
        .filter(Boolean);
    }
    if (resource === "members" && typeof values.videos === "string") {
      const videoUrls = values.videos
        .split(";")
        .map((url) => url.trim())
        .filter(Boolean);
      values.videos = await Promise.all(
        videoUrls.map(async (url) => {
          const videoId = url.match(
            /(?:youtu\.be\/|v=|embed\/)([\w-]{11})/,
          )?.[1];
          const fallback = {
            title: "Vídeo do YouTube",
            url,
            thumbnailUrl: videoId
              ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
              : "",
          };
          try {
            const data = await api.youtubeMetadata(url);
            return {
              title: data.title || fallback.title,
              url,
              thumbnailUrl: data.thumbnailUrl || fallback.thumbnailUrl,
            };
          } catch {
            return fallback;
          }
        }),
      );
    }
    if (resource === "projects" && typeof values.links === "string") {
      values.links = values.links
        .split(";")
        .map((item) => {
          const [label, url] = item.split("|").map((value) => value.trim());
          return { label, url: url ?? "" };
        })
        .filter((link) => link.label && link.url);
    }
    if (resource === "projects") {
      values.featured = values.featured === "on";
      if (!values.championshipId) delete values.championshipId;
    }
    try {
      const saved = editing
        ? await api.update(resource, editing._id, values, token)
        : await api.create(resource, values, token);
      setRecords((current) =>
        editing
          ? current.map((item) => (item._id === saved._id ? saved : item))
          : [saved, ...current],
      );
      setShowForm(false);
      setEditing(null);
      setNotice("Alteração salva com sucesso.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    }
  };
  const removeRecord = async (record: ApiRecord) => {
    if (
      !resource ||
      !confirm(`Excluir “${String(record.name ?? record.title)}”?`)
    )
      return;
    try {
      await api.remove(resource, record._id, token);
      setRecords((current) =>
        current.filter((item) => item._id !== record._id),
      );
      setNotice("Registro excluído.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível excluir.",
      );
    }
  };
  if (!token)
    return (
      <section className="auth">
        <form onSubmit={submitLogin}>
          <span className="brand">
            <Brand />
          </span>
          <h1>Painel administrativo</h1>
          <p>Entre com o usuário administrador criado no MongoDB.</p>
          {error && <p className="form-error">{error}</p>}
          <label>
            E-mail
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>
          <label>
            Senha
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          <button className="primary">
            Entrar <ArrowRight />
          </button>
        </form>
      </section>
    );
  return (
    <section className="admin">
      <aside>
        <span className="brand">
          <Brand />
        </span>
        <p>GERENCIAR</p>
        {(Object.keys(adminModules) as Array<keyof typeof adminModules>).map(
          (key) => (
            <button
              className={section === key ? "active-admin" : ""}
              onClick={() => {
                setSection(key);
                setShowForm(false);
                setEditing(null);
              }}
              key={key}
            >
              {adminModules[key].label}
            </button>
          ),
        )}
        <button
          onClick={() => {
            sessionStorage.removeItem("adminToken");
            setToken("");
            navigate("/");
          }}
        >
          Sair
        </button>
      </aside>
      <div className="admin-content">
        <p className="eyebrow">ADMINISTRAÇÃO / {module.label.toUpperCase()}</p>
        <h1>{module.title}</h1>
        <p className="admin-description">{module.description}</p>
        {error && <div className="form-error">{error}</div>}
        {notice && <div className="admin-notice">{notice}</div>}
        {section === "overview" ? (
          <>
            <section className="overview-dashboard">
              <div className="overview-metrics">
                {[
                  ["users", "Usuários"],
                  ["projects", "Projetos"],
                  ["members", "Integrantes"],
                  ["videos", "Vídeos"],
                  ["projectClicks", "Acessos aos projetos"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <small>{label}</small>
                    <b>{String(overview[key] ?? 0)}</b>
                    <span>dados atualizados</span>
                  </div>
                ))}
              </div>
              <div className="overview-grid">
                <article className="overview-panel overview-chart">
                  <div>
                    <h2>Atividade no período</h2>
                    <small>Cadastros e publicações dos últimos 7 dias</small>
                  </div>
                  <div className="overview-line-chart">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Atividade dos últimos 7 dias"><defs><linearGradient id="activity-gradient" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a855f7" stopOpacity=".32" /><stop offset="1" stopColor="#7c3aed" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${chartPoints} 100,100`} fill="url(#activity-gradient)" /><polyline points={chartPoints} fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />{chartDays.map((day, index) => <circle key={day.label} cx={(index / Math.max(1, chartDays.length - 1)) * 100} cy={88 - (day.value / chartMax) * 52} r="2.5" fill="#c084fc"><title>{`${day.label}: ${day.value}`}</title></circle>)}</svg>
                    <div>{chartDays.map((day) => <span key={day.label}>{day.label}</span>)}</div>
                  </div>
                </article>
                <article className="overview-panel">
                  <h2>Redes vinculadas</h2>
                  {overviewNetworks.length ? (
                    overviewNetworks.map((network) => (
                      <div className="overview-network" key={network.name}>
                        <span>{network.name}</span>
                        <b>{network.value}</b>
                        <i
                          style={{
                            width: `${Math.min(100, network.value * 20)}%`,
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <p>Nenhuma rede cadastrada.</p>
                  )}
                </article>
                <article className="overview-panel">
                  <h2>Atividades recentes</h2>
                  {overviewActivities.length ? (
                    overviewActivities.map((activity, index) => (
                      <div
                        className="overview-activity"
                        key={`${activity.title}-${index}`}
                      >
                        <i />
                        <div>
                          <b>{activity.title}</b>
                          <small>{activity.type}</small>
                        </div>
                        <time>
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleDateString(
                                "pt-BR",
                              )
                            : ""}
                        </time>
                      </div>
                    ))
                  ) : (
                    <p>Sem atividades recentes.</p>
                  )}
                </article>
                <article className="overview-panel">
                  <h2>Projetos mais acessados</h2>
                  {overviewProjects.length ? (
                    overviewProjects.map((project, index) => (
                      <div className="overview-project" key={project.name}>
                        <span>{index + 1}</span>
                        <b>{project.name}</b>
                        <i />
                        <small>{project.clicks} acessos</small>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum projeto cadastrado.</p>
                  )}
                </article>
              </div>
            </section>
            <div className="admin-stats">
              {[
                ["members", "integrantes"],
                ["projects", "projetos"],
                ["articles", "notícias"],
                ["players", "jogadores"],
              ].map(([key, label]) => (
                <div key={key}>
                  <b>{String(overview[key] ?? "—")}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : section === "settings" ? <SettingsManager token={token} /> : section === "members" ? (
          <section className="member-admin-dashboard">
            <div className="member-admin-toolbar">
              <div className="member-admin-filters">
                <input
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Buscar integrantes..."
                  aria-label="Buscar integrantes"
                />
                <select
                  value={memberRole}
                  onChange={(event) => setMemberRole(event.target.value)}
                  aria-label="Filtrar por cargo"
                >
                  <option value="all">Todos os cargos</option>
                  {memberRoles.map((role) => (
                    <option value={role} key={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setEditing(null);
                  setImageUrl("");
                  setImagePositionX(50);
                  setImagePositionY(50);
                  setShowForm(true);
                }}
              >
                + Adicionar integrante
              </button>
            </div>
            <div className="member-admin-stats">
              <div>
                <small>Total</small>
                <b>{records.length}</b>
                <span>integrantes</span>
              </div>
              <div>
                <small>Online agora</small>
                <b>
                  {
                    records.filter((member) => member.status !== "offline")
                      .length
                  }
                </b>
                <span>disponíveis</span>
              </div>
              <div>
                <small>Com foto</small>
                <b>
                  {records.filter((member) => Boolean(member.imageUrl)).length}
                </b>
                <span>perfis completos</span>
              </div>
              <div>
                <small>Novos (30 dias)</small>
                <b>
                  {
                    records.filter((member) => {
                      const created = new Date(String(member.createdAt ?? 0));
                      return (
                        !Number.isNaN(created.getTime()) &&
                        Date.now() - created.getTime() < 30 * 86400000
                      );
                    }).length
                  }
                </b>
                <span>recentes</span>
              </div>
            </div>
            <section className="featured-sort-panel member-sort-panel">
              <div>
                <h2>Ordem da equipe</h2>
                <p>Arraste os cards para escolher a ordem em que os integrantes aparecem no site.</p>
              </div>
              <div className="featured-sort-cards member-sort-cards">
                {orderedMembers.map((member) => (
                  <article
                    className="featured-sort-card member-sort-card"
                    key={member._id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", member._id);
                      setDraggedMemberId(member._id);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const source = event.dataTransfer.getData("text/plain") || draggedMemberId;
                      setDraggedMemberId(source);
                      void reorderMembers(member._id, source);
                    }}
                  >
                    {typeof member.imageUrl === "string" ? (
                      <img src={member.imageUrl} alt="" />
                    ) : (
                      <b className="member-sort-fallback">{String(member.name ?? "?").slice(0, 1)}</b>
                    )}
                    <span>{String(member.name ?? "Integrante")}</span>
                    <span className="admin-role-badges">{roleLabels(member.role ?? "Membro").map((role) => <RoleBadge key={role} role={role} />)}</span>
                  </article>
                ))}
                {!orderedMembers.length && <p>Cadastre integrantes para definir uma ordem.</p>}
              </div>
            </section>
            {showForm && (
              <div className="admin-modal">
                <form
                  className="admin-form member-admin-form"
                  onSubmit={submitRecord}
                >
                  {fields.members.map(([key, label, type]) => {
                    if (key === "role") return <ListEditor key={`${String(editing?._id ?? "new")}-roles`} label="Cargos no grupo" name="role" separator=", " placeholder="Ex.: Fundador" initialItems={String(editing?.role ?? "").split(",").map((role) => role.trim()).filter(Boolean)} />;
                    if (key === "projects") return <ListEditor key={`${String(editing?._id ?? "new")}-projects`} label="Projetos em andamento" name="projects" separator="," placeholder="Nome do projeto" initialItems={Array.isArray(editing?.projects) ? editing.projects.map(String) : []} />;
                    if (key === "videos") return <ListEditor key={`${String(editing?._id ?? "new")}-videos`} label="Vídeos do YouTube" name="videos" placeholder="Cole o link do vídeo" initialItems={Array.isArray(editing?.videos) ? editing.videos.map((video) => typeof video === "object" && video !== null ? String((video as ApiRecord).url ?? "") : String(video)).filter(Boolean) : []} />;
                    if (key === "description")
                      return (
                        <label className="member-description-field" key={key}>
                          {label}
                          <textarea
                            name={key}
                            defaultValue={memberFormValue(key)}
                          />
                        </label>
                      );
                    if (key === "socials")
                      return (
                        <fieldset className="member-social-picker" key={key}>
                          <legend>{label}</legend>
                          {socialNetworks.map((network) => (
                            <label className="member-social-line" key={network}>
                              <span><SocialIcon network={network} official />{network}</span>
                              <input name={`social_${network.toLowerCase()}`} type="url" placeholder={`Cole o link do ${network}`} defaultValue={memberSocialUrl(network)} />
                            </label>
                          ))}
                        </fieldset>
                      );
                    if (key === "imageUrl")
                      return (
                        <label className="member-image-field" key={key}>
                          {label}
                          <div>
                            <input
                              name={key}
                              type="url"
                              value={imageUrl}
                              placeholder="https://..."
                              onChange={(event) =>
                                setImageUrl(event.target.value)
                              }
                            />
                            <span>ou</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void uploadImage(file);
                              }}
                            />
                          </div>
                        </label>
                      );
                    if (key === "videos")
                      return (
                        <label className="member-video-field" key={key}>
                          {label}
                          <textarea
                            name={key}
                            defaultValue={memberFormValue(key)}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                          <small>
                            O título e a miniatura são preenchidos
                            automaticamente.
                          </small>
                        </label>
                      );
                    return (
                      <label key={key}>
                        {label}
                        <input
                          name={key}
                          type={type}
                          defaultValue={memberFormValue(key)}
                          required={key === "name" || key === "slug"}
                        />
                      </label>
                    );
                  })}
                  <div className="admin-form-actions">
                    <button className="primary" disabled={uploading}>{uploading ? "Enviando..." : "Salvar"} <ArrowRight /></button>
                    <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
            <div className="member-admin-list">
              <div className="member-admin-list-head">
                <span>Usuário</span>
                <span>Cargo</span>
                <span>Entrou em</span>
                <span />
              </div>
              {loading ? (
                <p>Carregando...</p>
              ) : (
                visibleMembers.map((member) => (
                  <div className="member-admin-row" key={member._id}>
                    <div className="member-admin-identity">
                      <span className="member-admin-avatar">
                        {typeof member.imageUrl === "string" ? (
                          <img src={member.imageUrl} alt="" />
                        ) : (
                          String(member.name ?? "?").slice(0, 1)
                        )}
                      </span>
                      <b>{String(member.name ?? "Sem nome")}</b>
                    </div>
                    <span className="admin-role-badges">{roleLabels(member.role ?? "Membro").map((role) => <RoleBadge key={role} role={role} />)}</span>
                    <time>
                      {member.createdAt
                        ? new Date(String(member.createdAt)).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </time>
                    <div>
                      <button
                        onClick={() => {
                          setEditing(member);
                          setImageUrl(String(member.imageUrl ?? ""));
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => removeRecord(member)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
              {!loading && !visibleMembers.length && (
                <p>Nenhum integrante encontrado.</p>
              )}
            </div>
          </section>
        ) : section === "projects" ? (
          <section className="member-admin-dashboard project-admin-dashboard">
            <div className="member-admin-toolbar">
              <div className="member-admin-filters">
                <input
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                  placeholder="Buscar projetos..."
                />
                <select
                  value={projectStatus}
                  onChange={(event) => setProjectStatus(event.target.value)}
                >
                  <option value="all">Todos os status</option>
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setEditing(null);
                  setImageUrl("");
                  setImagePositionX(50);
                  setImagePositionY(50);
                  setProjectPreviewName("Título do destaque");
                  setProjectPreviewAction("Ver projeto");
                  setShowForm(true);
                }}
              >
                + Novo projeto
              </button>
            </div>
            <div className="member-admin-stats">
              <div>
                <small>Total</small>
                <b>{records.length}</b>
                <span>projetos</span>
              </div>
              <div>
                <small>Em andamento</small>
                <b>
                  {
                    records.filter(
                      (project) =>
                        !String(project.status ?? "")
                          .toLowerCase()
                          .includes("conclu"),
                    ).length
                  }
                </b>
                <span>ativos</span>
              </div>
              <div>
                <small>Em destaque</small>
                <b>
                  {
                    records.filter((project) => project.featured === true)
                      .length
                  }
                </b>
                <span>na página inicial</span>
              </div>
              <div>
                <small>Acessos</small>
                <b>
                  {records.reduce(
                    (total, project) => total + Number(project.clicks ?? 0),
                    0,
                  )}
                </b>
                <span>cliques registrados</span>
              </div>
            </div>
            {showForm && (
              <div className="admin-modal">
                <form className="admin-form" onSubmit={submitRecord}>
                  {fields.projects.map(([key, label, type]) => (
                    key === "links" ? <LinkListEditor key={`${String(editing?._id ?? "new")}-links`} initialItems={Array.isArray(editing?.links) ? editing.links.filter((link): link is ApiRecord => typeof link === "object" && link !== null).map((link) => ({ label: String(link.label ?? ""), url: String(link.url ?? "") })).filter((link) => link.label && link.url) : []} /> : key === "imageUrl" ? <label className="unified-image-field" key={key}>{label}<div><input name={key} type="url" value={imageUrl} placeholder="https://..." onChange={(event) => setImageUrl(event.target.value)} /><span>ou</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} /></div></label> : <label className={type === "checkbox" ? "project-feature-toggle" : undefined} key={key}>
                      {type === "checkbox" ? <span>{label}</span> : label}
                      <input
                        name={key}
                        type={type}
                        value={key === "imageUrl" ? imageUrl : undefined}
                        defaultChecked={
                          type === "checkbox"
                            ? Boolean(editing?.[key])
                            : undefined
                        }
                        defaultValue={
                          type === "checkbox" || key === "imageUrl"
                            ? undefined
                            : key === "links" && Array.isArray(editing?.links)
                              ? editing.links
                                  .map((link) =>
                                    typeof link === "object" && link !== null
                                      ? `${String((link as Record<string, unknown>).label ?? "")}|${String((link as Record<string, unknown>).url ?? "")}`
                                      : "",
                                  )
                                  .filter(Boolean)
                                  .join("; ")
                              : String(editing?.[key] ?? "")
                        }
                        onChange={
                          key === "imageUrl"
                            ? (event) => setImageUrl(event.target.value)
                            : key === "name"
                              ? (event) => setProjectPreviewName(event.target.value || "Título do destaque")
                              : key === "ctaLabel"
                                ? (event) => setProjectPreviewAction(event.target.value || "Ver projeto")
                            : undefined
                        }
                        required={key === "name" || key === "slug"}
                      />
                    </label>
                  ))}
                  {imageUrl && <section className="project-image-preview-control">
                    <input type="hidden" name="imagePosition" value={`${imagePositionX}% ${imagePositionY}%`} />
                    <p>Prévia do destaque na página inicial</p>
                    <div className="project-image-preview-stage">
                      <article
                        className="home-highlight home-highlight-preview"
                        style={imageUrl ? { backgroundImage: `linear-gradient(#090b1422,#090b14aa), url(${imageUrl})`, backgroundPosition: `${imagePositionX}% ${imagePositionY}%` } : undefined}
                      >
                        <span>{projectPreviewName}</span>
                        <small>{projectPreviewAction}</small>
                      </article>
                    </div>
                    <label>Horizontal
                      <input type="range" min="0" max="100" value={imagePositionX} onChange={(event) => setImagePositionX(Number(event.target.value))} />
                    </label>
                    <label>Vertical
                      <input type="range" min="0" max="100" value={imagePositionY} onChange={(event) => setImagePositionY(Number(event.target.value))} />
                    </label>
                  </section>}
                  <label>
                    Vincular a campeonato (opcional)
                    <select name="championshipId" defaultValue={String(editing?.championshipId ?? "")}>
                      <option value="">Nenhum campeonato</option>
                      {availableSeasons.map((season) => (
                        <option key={season._id} value={String(season._id)}>
                          {String(season.name ?? "Campeonato")} · Temporada {String(season.number ?? "")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="admin-form-actions">
                    <button className="primary" disabled={uploading}>{uploading ? "Enviando..." : "Salvar"} <ArrowRight /></button>
                    <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
            <div className="member-admin-list project-admin-list">
              <section className="featured-sort-panel">
                <div>
                  <h2>Ordem dos destaques</h2>
                  <p>Arraste os cards para definir como aparecerão na página inicial.</p>
                </div>
                <div className="featured-sort-cards">
                  {featuredProjects.map((project) => (
                    <article
                      className="featured-sort-card"
                      key={project._id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", project._id);
                        setDraggedProjectId(project._id);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const source = event.dataTransfer.getData("text/plain") || draggedProjectId;
                        setDraggedProjectId(source);
                        void reorderHighlights(project._id, source);
                      }}
                    >
                      <span>{String(project.name ?? "Projeto")}</span>
                      <small>{String(project.ctaLabel ?? "Ver projeto")}</small>
                    </article>
                  ))}
                  {!featuredProjects.length && <p>Nenhum projeto marcado como destaque.</p>}
                </div>
              </section>
              <div className="project-admin-list-head">
                <span>Projeto</span>
                <span>Status</span>
                <span>Membros</span>
                <span>Acessos</span>
                <span>Atualizado em</span>
                <span />
              </div>
              {loading ? (
                <p>Carregando...</p>
              ) : (
                visibleProjects.map((project) => (
                  <div
                    className="project-admin-row"
                    key={project._id}
                  >
                    <div className="member-admin-identity">
                      <span className="member-admin-avatar">
                        {typeof project.imageUrl === "string" ? (
                          <img src={project.imageUrl} alt="" />
                        ) : (
                          String(project.name ?? "?").slice(0, 1)
                        )}
                      </span>
                      <b>{String(project.name ?? "Sem nome")}</b>
                    </div>
                    <span className="project-status">
                      {String(project.status ?? "Em andamento")}
                    </span>
                    <span>
                      {Array.isArray(project.team) ? project.team.length : 0}
                    </span>
                    <span>{Number(project.clicks ?? 0)}</span>
                    <time>
                      {project.updatedAt
                        ? new Date(
                            String(project.updatedAt),
                          ).toLocaleDateString("pt-BR")
                        : "—"}
                    </time>
                    <div>
                      <button
                        onClick={() => {
                          setEditing(project);
                          setImageUrl(String(project.imageUrl ?? ""));
                          const position = String(project.imagePosition ?? "50% 50%").match(/(\d+)%\s+(\d+)%/);
                          setImagePositionX(Number(position?.[1] ?? 50));
                          setImagePositionY(Number(position?.[2] ?? 50));
                          setProjectPreviewName(String(project.name ?? "Título do destaque"));
                          setProjectPreviewAction(String(project.ctaLabel ?? "Ver projeto"));
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => removeRecord(project)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
              {!loading && !visibleProjects.length && (
                <p>Nenhum projeto encontrado.</p>
              )}
            </div>
          </section>
        ) : (
          <>
            {section !== "championship" &&
              <button
                className="primary admin-add"
                onClick={() => {
                  setEditing(null);
                  setImageUrl("");
                  setShowForm(true);
                }}
              >
                + Adicionar
              </button>
            }
            {showForm && resource && (
              <div className="admin-modal">
                <form className={`admin-form ${resource === "articles" ? "article-editor-form" : ""}`} onSubmit={submitRecord}>
                  <h2 className="admin-form-title">{resource === "articles" ? (editing ? "Editar matéria" : "Nova matéria") : editing ? "Editar registro" : "Novo registro"}</h2>
                  {fields[resource].map(([key, label, type]) => (
                    resource === "players" && key === "types" ? <ListEditor key={`${String(editing?._id ?? "new")}-types`} label="Tipos Pokémon" name="types" separator="," maxItems={2} placeholder="Ex.: Fire" initialItems={Array.isArray(editing?.types) ? editing.types.map(String) : []} /> : type === "season-status" ? (
                      <label key={key}>{label}<select name={key} value={seasonStatus} onChange={(event) => setSeasonStatus(event.target.value)}><option value="active">Em andamento</option><option value="upcoming">Em breve</option><option value="completed">Encerrado</option></select></label>
                    ) : (key === "startsAt" || key === "endsAt") && resource === "seasons" && seasonStatus !== "completed" ? null : key === "imageUrl" || key === "coverUrl" ? (
                      <label className="unified-image-field" key={key}>
                        {label}
                        <div>
                          <input name={key} type="url" value={imageUrl} placeholder="https://..." onChange={(event) => setImageUrl(event.target.value)} />
                          <span>ou</span>
                          <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} />
                        </div>
                      </label>
                    ) : type === "textarea" ? (
                      <label className={key === "content" ? "article-content-field" : undefined} key={key}>
                        {label}
                        <textarea name={key} defaultValue={String(editing?.[key] ?? "")} />
                      </label>
                    ) : <label className={type === "checkbox" ? "admin-checkbox-field" : undefined} key={key}>
                      {label}
                      <input
                        name={key}
                        type={type}
                        value={
                          type === "checkbox"
                            ? undefined
                            : key === "imageUrl" || key === "coverUrl"
                              ? imageUrl
                              : undefined
                        }
                        defaultChecked={
                          type === "checkbox"
                            ? Boolean(editing?.[key])
                            : undefined
                        }
                        defaultValue={
                          type === "checkbox" || key === "imageUrl" || key === "coverUrl"
                            ? undefined
                            : key === "socials" &&
                                Array.isArray(editing?.socials)
                              ? editing.socials
                                  .map((social) =>
                                    typeof social === "object" &&
                                    social !== null &&
                                    "network" in social
                                      ? `${String((social as { network: unknown }).network)}|${String((social as { url?: unknown }).url ?? "")}`
                                      : String(social),
                                  )
                                  .join(", ")
                              : key === "projects" &&
                                  Array.isArray(editing?.projects)
                                ? editing.projects.map(String).join(", ")
                                : key === "links" &&
                                    Array.isArray(editing?.links)
                                  ? editing.links
                                      .map((link) =>
                                        typeof link === "object" &&
                                        link !== null
                                          ? `${String((link as Record<string, unknown>).label ?? "")}|${String((link as Record<string, unknown>).url ?? "")}`
                                          : "",
                                      )
                                      .filter(Boolean)
                                      .join("; ")
                                  : key === "videos" &&
                                      Array.isArray(editing?.videos)
                                    ? editing.videos
                                        .map((video) =>
                                          typeof video === "object" &&
                                          video !== null
                                            ? [
                                                String(
                                                  (
                                                    video as Record<
                                                      string,
                                                      unknown
                                                    >
                                                  ).title ?? "",
                                                ),
                                                String(
                                                  (
                                                    video as Record<
                                                      string,
                                                      unknown
                                                    >
                                                  ).url ?? "",
                                                ),
                                                String(
                                                  (
                                                    video as Record<
                                                      string,
                                                      unknown
                                                    >
                                                  ).thumbnailUrl ?? "",
                                                ),
                                              ].join("|")
                                            : "",
                                        )
                                        .join("; ")
                                    : String(editing?.[key] ?? "")
                        }
                        onChange={
                          key === "imageUrl" || key === "coverUrl"
                            ? (event) => setImageUrl(event.target.value)
                            : undefined
                        }
                        required={
                          key === "name" || key === "title" || key === "slug"
                        }
                      />
                    </label>
                  ))}
                  {resource === "seasons" && imageUrl && <div className="championship-card-preview" style={{ backgroundImage: `linear-gradient(90deg, #161b2eee 15%, #11182799 58%, #11182722), url(${imageUrl})` }}><span>Prévia do card de campeonato</span><strong>{String(editing?.name ?? "Nome do campeonato")}</strong><small>Temporada {String(editing?.number ?? "1")} · {String(editing?.currentRound ?? "Rodada 1")}</small></div>}
                  <div className="admin-form-actions">
                    <button className="primary" disabled={uploading}>{uploading ? "Enviando..." : "Salvar"} <ArrowRight /></button>
                    <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
            <div className="admin-table">
              <div className="admin-table-head">
                <span>Item</span>
                <span>Detalhe</span>
                <span>Ações</span>
              </div>
              {loading ? (
                <div className="admin-table-row">Carregando…</div>
              ) : (
                records.map((record) => (
                  <div className="admin-table-row" key={record._id}>
                    <b>{String(record.name ?? record.title ?? "Sem nome")}</b>
                    <span>
                      {String(
                        record.role ??
                          record.status ??
                          record.category ??
                          record.monotype ??
                          record.type ??
                          "—",
                      )}
                    </span>
                    <div>
                      <button
                        onClick={() => {
                          setEditing(record);
                          setImageUrl(String(record.imageUrl ?? record.coverUrl ?? ""));
                          if (resource === "seasons") setSeasonStatus(String(record.status ?? "upcoming"));
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => removeRecord(record)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {section === "championship" && (
              <BattleManager
                token={token}
                onCreateSeason={() => {
                  setEditing(null);
                  setSeasonStatus("upcoming");
                  setShowForm(true);
                }}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
function Footer() {
  const [siteSettings, setSiteSettings] = useState<ApiRecord>({ _id: "", socials: [] });
  useEffect(() => { void api.siteSettings().then(setSiteSettings).catch(() => undefined); }, []);
  const siteSocials = Array.isArray(siteSettings.socials)
    ? siteSettings.socials.filter((social): social is ApiRecord => typeof social === "object" && social !== null && Boolean((social as ApiRecord).url))
    : [];
  return (
    <footer>
      <div className="brand">
        <Brand />
      </div>
      <p>Conteúdo, comunidade e jogos. Do nosso jeito.</p>
      {siteSocials.length > 0 && <div>{siteSocials.map((social) => <a key={String(social.network)} href={String(social.url)} aria-label={String(social.network)} target="_blank" rel="noreferrer"><SocialIcon network={String(social.network)} /></a>)}</div>}
      <small>© 2026 OG Connect · Feito para quem cria junto.</small>
    </footer>
  );
}
function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equipe" element={<TeamPage />} />
        <Route path="/equipe/:id" element={<Profile />} />
        <Route path="/ao-vivo" element={<LiveChannelsPage />} />
        <Route path="/campeonato" element={<ChampionshipsPage />} />
        <Route path="/campeonatos" element={<ChampionshipsPage />} />
        <Route path="/campeonatos/:id" element={<ChampionshipLive />} />
        <Route path="/noticias" element={<NewsPage />} />
        <Route path="/noticias/:id" element={<PublicArticlePage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AppShell>
  );
}
export default App;
