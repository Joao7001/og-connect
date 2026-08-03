import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type ApiRecord } from "../api";
import { Avatar, memberFromApi, SectionHeading, socialData, SocialIcon } from "../components/public/Shared";

export default function TeamPage() {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  useEffect(() => { api.list("members").then(setRecords).catch(() => setRecords([])); }, []);
  const currentMembers = records.slice().sort((a, b) => Number(a.displayOrder ?? Number.MAX_SAFE_INTEGER) - Number(b.displayOrder ?? Number.MAX_SAFE_INTEGER)).map(memberFromApi);
  return <section className="container page"><SectionHeading eyebrow="PESSOAS QUE FAZEM" title="A nossa equipe" text="Cada voz, uma perspectiva. Cada criador, uma parte da história." /><div className="member-grid member-showcase">{currentMembers.map((member) => <Link to={`/equipe/${member.id}`} className="member-card" key={member.id}><Avatar member={member} large /><h3>{member.name}</h3><p>{member.role}</p><div className="member-socials">{member.socials.slice(0, 6).map((social) => <span key={socialData(social).network}><SocialIcon network={socialData(social).network} official /></span>)}</div></Link>)}{!currentMembers.length && <p>Nenhum integrante cadastrado ainda.</p>}</div></section>;
}
