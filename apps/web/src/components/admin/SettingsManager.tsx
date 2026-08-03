import { type FormEvent, useEffect, useState } from "react";
import { api, type ApiRecord } from "../../api";

const networks = ["YouTube", "Discord", "Instagram", "Twitch", "TikTok", "X", "Facebook", "Kick"];

function socialUrl(settings: ApiRecord, network: string) {
  if (!Array.isArray(settings.socials)) return "";
  const social = settings.socials.find((item) => typeof item === "object" && item !== null && String((item as ApiRecord).network) === network) as ApiRecord | undefined;
  return String(social?.url ?? "");
}

export function SettingsManager({ token }: { token: string }) {
  const [settings, setSettings] = useState<ApiRecord>({ _id: "", name: "OG Connect", socials: [] });
  const [users, setUsers] = useState<ApiRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void Promise.all([api.siteSettings(), api.adminUsers(token)]).then(([data, admins]) => {
      setSettings(data);
      setUsers(admins);
    });
  }, [token]);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const socials = networks.map((network) => ({ network, url: String(values[`social_${network}`] ?? "") })).filter((item) => item.url);
    setSettings(await api.updateSiteSettings({ name: values.name, description: values.description, siteUrl: values.siteUrl, socials }, token));
    setMessage("Configurações salvas.");
  };

  return <section className="settings-dashboard">
    {message && <div className="admin-notice">{message}</div>}
    <form className="settings-card" onSubmit={saveSettings}>
      <h2>Informações e redes</h2>
      <label>Nome da plataforma<input name="name" defaultValue={String(settings.name ?? "OG Connect")} /></label>
      <label>Descrição<input name="description" defaultValue={String(settings.description ?? "")} /></label>
      <label>URL do site<input name="siteUrl" defaultValue={String(settings.siteUrl ?? "")} /></label>
      {networks.map((network) => <label key={network}>{network}<input name={`social_${network}`} defaultValue={socialUrl(settings, network)} placeholder="https://..." /></label>)}
      <button className="primary">Salvar alterações</button>
    </form>
    <section className="settings-card"><h2>Administradores</h2>{users.map((user) => <p key={user._id}>{String(user.email)}</p>)}<form onSubmit={async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const user = await api.createAdmin(String(values.email), String(values.password), token); setUsers((items) => [user, ...items]); event.currentTarget.reset(); }}><input name="email" type="email" placeholder="novo@admin.com" required /><input name="password" type="password" placeholder="Senha (mín. 6)" required /><button className="secondary">Criar administrador</button></form></section>
    <section className="settings-card"><h2>Alterar minha senha</h2><form onSubmit={async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await api.changePassword(String(values.currentPassword), String(values.newPassword), token); event.currentTarget.reset(); setMessage("Senha atualizada."); }}><input name="currentPassword" type="password" placeholder="Senha atual" required /><input name="newPassword" type="password" placeholder="Nova senha (mín. 6)" required /><button className="secondary">Alterar senha</button></form></section>
  </section>;
}
