import type { ApiRecord } from "../../api";
import { Brush, Code2, Crown, Shield, ShieldCheck, UserRound, Users } from "lucide-react";

export type Member = {
  id: string; name: string; handle: string; role: string; color: string; initials: string; description: string; specialty: string;
  socials: Array<string | { network: string; url: string }>; imageUrl?: string;
};

export function Avatar({ member, large = false }: { member: Member; large?: boolean }) {
  return <div className={`avatar ${large ? "avatar-large" : ""}`} style={{ background: `linear-gradient(135deg, ${member.color}, #0D1117)` }}>{member.imageUrl ? <img src={member.imageUrl} alt={`Foto de ${member.name}`} /> : member.initials}</div>;
}

export function socialData(social: string | { network: string; url: string }) { return typeof social === "string" ? { network: social, url: "#" } : social; }

export function SocialIcon({ network, official = false }: { network: string; official?: boolean }) {
  const key = network.toLowerCase().replace("twitter/x", "x").replace("twitter", "x").replaceAll(" ", "");
  const supported = new Set(["youtube", "discord", "instagram", "twitch", "tiktok", "x", "facebook", "kick"]);
  if (!supported.has(key)) return <span className="social-icon-fallback">{network.slice(0, 1)}</span>;
  return <span className={official ? `social-icon-official ${key}` : "social-icon"} role="img" aria-label={network} style={{ maskImage: `url(/icons/social/${key}.svg)`, WebkitMaskImage: `url(/icons/social/${key}.svg)` }} />;
}

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="heading"><span>{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

type RoleKind = "founder" | "ceo" | "admin" | "moderator" | "designer" | "developer" | "autism" | "member";

function roleKind(role: string): RoleKind {
  const normalized = role.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("fundador") || normalized.includes("funador")) return "founder";
  if (normalized.includes("ceo")) return "ceo";
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("moderador")) return "moderator";
  if (normalized.includes("designer")) return "designer";
  if (normalized.includes("dev") || normalized.includes("desenvolvedor")) return "developer";
  if (normalized.includes("autismo") || normalized.includes("autista")) return "autism";
  return "member";
}

export function RoleBadge({ role }: { role: string }) {
  const kind = roleKind(role);
  const Icon = { founder: Crown, ceo: ShieldCheck, admin: Shield, moderator: Users, designer: Brush, developer: Code2, member: UserRound }[kind === "autism" ? "member" : kind];
  return <span className={`role-badge role-${kind}`} title={role}>{kind === "autism" ? <span className="role-badge-emoji" aria-hidden="true">🧩</span> : <Icon size={12} strokeWidth={2.3} />}<span>{role}</span></span>;
}

export function memberFromApi(record: ApiRecord, index = 0): Member {
  const name = String(record.name ?? "Criador");
  return { id: String(record.slug ?? record._id), name, handle: `@${String(record.slug ?? "grupo").replaceAll("-", "")}`, role: String(record.role ?? record.specialty ?? "Integrante"), color: ["#4F46E5", "#3B82F6", "#22C55E", "#F59E0B"][index % 4], initials: name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(), description: String(record.description ?? ""), specialty: String(record.specialty ?? ""), socials: Array.isArray(record.socials) ? record.socials.map((social) => typeof social === "object" && social !== null && "network" in social ? { network: String((social as { network: unknown }).network), url: String((social as { url?: unknown }).url ?? "#") } : String(social)) : [], imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : undefined };
}
