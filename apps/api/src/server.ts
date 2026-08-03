import bcrypt from "bcryptjs";
import cors from "cors";
import dns from "node:dns";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { requireAuth } from "./auth.js";
import {
  Article,
  Battle,
  Event,
  Media,
  Member,
  Player,
  Project,
  Season,
  SiteSettings,
  User,
} from "./models.js";

const currentFile = fileURLToPath(import.meta.url);
dotenv.config({ path: path.resolve(path.dirname(currentFile), "../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "2mb" }));
const asyncRoute =
  (handler: (request: Request, response: Response) => Promise<unknown>) =>
  (request: Request, response: Response) =>
    handler(request, response).catch((error) => {
      console.error(error);
      response.status(500).json({ message: "Unexpected server error." });
    });

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.get(
  "/api/site/summary",
  asyncRoute(async (_request, response) =>
    response.json({
      members: await Member.countDocuments(),
      projects: await Project.countDocuments(),
      articles: await Article.countDocuments(),
      players: await Player.countDocuments(),
      seasons: await Season.countDocuments(),
    }),
  ),
);
app.get(
  "/api/championship/current",
  asyncRoute(async (_request, response) => {
    const season =
      (await Season.findOne({ status: "active" }).sort({
        number: -1,
        createdAt: -1,
      })) ?? (await Season.findOne().sort({ number: -1, createdAt: -1 }));
    return response.json(season);
  }),
);
app.get(
  "/api/youtube/metadata",
  asyncRoute(async (request, response) => {
    const url = z.string().url().parse(request.query.url);
    const videoId = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];
    const fallback = {
      title: "Vídeo do YouTube",
      thumbnailUrl: videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : "",
    };
    try {
      const result = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      );
      if (!result.ok) return response.json(fallback);
      const data = (await result.json()) as {
        title?: string;
        thumbnail_url?: string;
      };
      return response.json({
        title: data.title || fallback.title,
        thumbnailUrl: data.thumbnail_url || fallback.thumbnailUrl,
      });
    } catch {
      return response.json(fallback);
    }
  }),
);
let liveChannelsCache: { expiresAt: number; data: unknown[] } | null = null;
let twitchAccessTokenCache: { token: string; expiresAt: number } | null = null;
let kickAccessTokenCache: { token: string; expiresAt: number } | null = null;
app.get(
  "/api/live/channels",
  asyncRoute(async (_request, response) => {
    if (liveChannelsCache && liveChannelsCache.expiresAt > Date.now())
      return response.json(liveChannelsCache.data);
    const members = await Member.find().lean();
    const supported = ["twitch", "youtube", "kick"];
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    const data = await Promise.all(
      members.map(async (member) => {
        const platforms = (Array.isArray(member.socials) ? member.socials : [])
          .filter((social) => social?.url && supported.includes(String(social.network ?? "").toLowerCase()))
          .map((social) => ({ network: String(social.network), url: String(social.url) }));
        if (!platforms.length) return null;
        const active: Array<{ network: string; url: string; title?: string }> = [];
        const youtube = platforms.find((platform) => platform.network.toLowerCase() === "youtube");
        if (youtube && youtubeKey) {
          try {
            const parsed = new URL(youtube.url);
            const handle = parsed.pathname.match(/^\/@([^/]+)/)?.[1];
            const channelId = parsed.pathname.match(/^\/channel\/([^/]+)/)?.[1];
            const channelQuery = channelId
              ? `id=${encodeURIComponent(channelId)}`
              : handle
                ? `forHandle=${encodeURIComponent(`@${handle}`)}`
                : "";
            if (channelQuery) {
              const channelResult = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&${channelQuery}&key=${encodeURIComponent(youtubeKey)}`);
              const channelData = await channelResult.json() as { items?: Array<{ id?: string }> };
              const resolvedId = channelData.items?.[0]?.id;
              if (resolvedId) {
                const streamResult = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&channelId=${encodeURIComponent(resolvedId)}&key=${encodeURIComponent(youtubeKey)}`);
                const streamData = await streamResult.json() as { items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string } }> };
                const stream = streamData.items?.[0];
                if (stream?.id?.videoId) active.push({ network: "YouTube", url: `https://www.youtube.com/watch?v=${stream.id.videoId}`, title: stream.snippet?.title });
              }
            }
          } catch {
            // A malformed channel URL or a temporary provider failure leaves the card offline.
          }
        }
        const twitch = platforms.find((platform) => platform.network.toLowerCase() === "twitch");
        const twitchClientId = process.env.TWITCH_CLIENT_ID;
        const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
        if (twitch && twitchClientId && twitchClientSecret) {
          try {
            if (!twitchAccessTokenCache || twitchAccessTokenCache.expiresAt <= Date.now()) {
              const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ client_id: twitchClientId, client_secret: twitchClientSecret, grant_type: "client_credentials" }),
              });
              const tokenData = await tokenResponse.json() as { access_token?: string; expires_in?: number };
              if (tokenData.access_token) twitchAccessTokenCache = { token: tokenData.access_token, expiresAt: Date.now() + Math.max(60, (tokenData.expires_in ?? 3600) - 120) * 1000 };
            }
            const login = new URL(twitch.url).pathname.split("/").filter(Boolean)[0];
            if (login && twitchAccessTokenCache) {
              const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`, {
                headers: { "Client-ID": twitchClientId, Authorization: `Bearer ${twitchAccessTokenCache.token}` },
              });
              const streamData = await streamResponse.json() as { data?: Array<{ title?: string }> };
              if (streamData.data?.[0]) active.push({ network: "Twitch", url: twitch.url, title: streamData.data[0].title });
            }
          } catch {
            // A malformed Twitch URL or temporary provider failure leaves the card offline.
          }
        }
        const kick = platforms.find((platform) => platform.network.toLowerCase() === "kick");
        const kickClientId = process.env.KICK_CLIENT_ID;
        const kickClientSecret = process.env.KICK_CLIENT_SECRET;
        if (kick && kickClientId && kickClientSecret) {
          try {
            if (!kickAccessTokenCache || kickAccessTokenCache.expiresAt <= Date.now()) {
              const tokenResponse = await fetch("https://id.kick.com/oauth/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ client_id: kickClientId, client_secret: kickClientSecret, grant_type: "client_credentials" }),
              });
              const tokenData = await tokenResponse.json() as { access_token?: string; expires_in?: number };
              if (tokenData.access_token) kickAccessTokenCache = { token: tokenData.access_token, expiresAt: Date.now() + Math.max(60, (tokenData.expires_in ?? 7200) - 120) * 1000 };
            }
            const slug = new URL(kick.url).pathname.split("/").filter(Boolean)[0];
            if (slug && kickAccessTokenCache) {
              const channelResponse = await fetch(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`, {
                headers: { Authorization: `Bearer ${kickAccessTokenCache.token}` },
              });
              const channelData = await channelResponse.json() as { data?: Array<{ stream?: { is_live?: boolean }; stream_title?: string }> };
              const channel = channelData.data?.[0];
              if (channel?.stream?.is_live === true) active.push({ network: "Kick", url: kick.url, title: channel.stream_title });
            }
          } catch {
            // A malformed Kick URL or temporary provider failure leaves the card offline.
          }
        }
        const preferred = active[0] ?? platforms[0];
        return {
          id: String(member._id),
          name: member.name,
          role: member.role,
          imageUrl: member.imageUrl,
          url: preferred.url,
          network: preferred.network,
          isLive: active.length > 0,
          streamTitle: active[0]?.title,
          // This list must contain only providers confirmed as live. It is
          // deliberately different from `platforms`, which lists all links
          // registered by the member.
          livePlatforms: active.map((platform) => platform.network),
          platforms: platforms.map((platform) => platform.network),
        };
      }),
    );
    const channels = data.filter(Boolean);
    liveChannelsCache = { data: channels, expiresAt: Date.now() + 60_000 };
    response.json(channels);
  }),
);
app.post(
  "/auth/login",
  asyncRoute(async (request, response) => {
    const values = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(request.body);
    const user = await User.findOne({ email: values.email });
    if (!user || !(await bcrypt.compare(values.password, user.passwordHash)))
      return response.status(401).json({ message: "Invalid credentials." });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" },
    );
    response.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  }),
);
app.get("/api/site/settings", asyncRoute(async (_request, response) =>
  response.json((await SiteSettings.findOne()) ?? { name: "OG Connect", socials: [] }),
));
app.patch("/api/site/settings", requireAuth, asyncRoute(async (request, response) => {
  const settings = await SiteSettings.findOneAndUpdate({}, request.body, { new: true, upsert: true, runValidators: true });
  response.json(settings);
}));
app.get("/api/admin/users", requireAuth, asyncRoute(async (_request, response) =>
  response.json(await User.find().select("email role createdAt").sort({ createdAt: -1 })),
));
app.post("/api/admin/users", requireAuth, asyncRoute(async (request, response) => {
  const values = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(request.body);
  const passwordHash = await bcrypt.hash(values.password, 12);
  response.status(201).json(await User.create({ email: values.email, passwordHash, role: "admin" }));
}));
app.patch("/api/admin/password", requireAuth, asyncRoute(async (request, response) => {
  const values = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) }).parse(request.body);
  const user = await User.findById((request as Request & { user?: { id: string } }).user?.id);
  if (!user || !(await bcrypt.compare(values.currentPassword, user.passwordHash))) return response.status(401).json({ message: "Senha atual incorreta." });
  user.passwordHash = await bcrypt.hash(values.newPassword, 12);
  await user.save(); response.json({ ok: true });
}));

function resources(path: string, Model: any) {
  app.get(
    `/api/${path}`,
    asyncRoute(async (_request, response) =>
      response.json(await Model.find().sort(path === "members" ? { displayOrder: 1, createdAt: -1 } : { createdAt: -1 })),
    ),
  );
  app.get(
    `/api/${path}/:slug`,
    asyncRoute(async (request, response) => {
      const item = await Model.findOne({ slug: request.params.slug });
      return item
        ? response.json(item)
        : response.status(404).json({ message: "Not found." });
    }),
  );
  app.post(
    `/api/${path}`,
    requireAuth,
    asyncRoute(async (request, response) =>
      response.status(201).json(await Model.create(request.body)),
    ),
  );
  app.patch(
    `/api/${path}/:id`,
    requireAuth,
    asyncRoute(async (request, response) =>
      response.json(
        await Model.findByIdAndUpdate(request.params.id, request.body, {
          new: true,
          runValidators: true,
        }),
      ),
    ),
  );
  app.delete(
    `/api/${path}/:id`,
    requireAuth,
    asyncRoute(async (request, response) => {
      await Model.findByIdAndDelete(request.params.id);
      response.status(204).end();
    }),
  );
}
resources("members", Member);
resources("projects", Project);
resources("articles", Article);
resources("events", Event);
resources("seasons", Season);
resources("media", Media);
app.get(
  "/api/players",
  asyncRoute(async (_request, response) =>
    response.json(await Player.find().sort({ wins: -1, losses: 1 })),
  ),
);
app.get(
  "/api/players/:slug",
  asyncRoute(async (request, response) => {
    const player = await Player.findOne({ slug: request.params.slug });
    return player
      ? response.json(player)
      : response.status(404).json({ message: "Not found." });
  }),
);
app.post(
  "/api/players",
  requireAuth,
  asyncRoute(async (request, response) =>
    response.status(201).json(await Player.create(request.body)),
  ),
);
app.patch(
  "/api/players/:id",
  requireAuth,
  asyncRoute(async (request, response) =>
    response.json(
      await Player.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
      }),
    ),
  ),
);
app.delete(
  "/api/players/:id",
  requireAuth,
  asyncRoute(async (request, response) => {
    await Player.findByIdAndDelete(request.params.id);
    response.status(204).end();
  }),
);
app.get(
  "/api/battles",
  asyncRoute(async (_request, response) =>
    response.json(
      await Battle.find()
        .populate("playerA playerB winner")
        .sort({ scheduledAt: 1 }),
    ),
  ),
);
app.post(
  "/api/battles",
  requireAuth,
  asyncRoute(async (request, response) =>
    response.status(201).json(await Battle.create(request.body)),
  ),
);
app.patch(
  "/api/battles/:id",
  requireAuth,
  asyncRoute(async (request, response) => {
    const previous = await Battle.findById(request.params.id);
    if (!previous) return response.status(404).json({ message: "Partida não encontrada." });
    const winnerId = request.body.winner ? String(request.body.winner) : "";
    if (
      request.body.status === "completed" &&
      (!winnerId ||
        (winnerId !== String(previous.playerA) && winnerId !== String(previous.playerB)))
    )
      return response.status(400).json({ message: "Selecione um vencedor desta partida." });

    const completedNow = previous.status !== "completed" && request.body.status === "completed";
    const revertedNow = previous.status === "completed" && request.body.status === "scheduled";
    const updated = await Battle.findByIdAndUpdate(request.params.id, {
      ...request.body,
      ...(completedNow ? { playedAt: new Date() } : {}),
    }, { new: true, runValidators: true });

    if (completedNow && updated) {
      const loserId = winnerId === String(previous.playerA)
        ? previous.playerB
        : previous.playerA;
      await Promise.all([
        Player.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } }),
        Player.findByIdAndUpdate(loserId, { $inc: { losses: 1 } }),
      ]);
    }
    if (revertedNow && previous.winner) {
      const previousWinner = String(previous.winner);
      const previousLoser = previousWinner === String(previous.playerA)
        ? previous.playerB
        : previous.playerA;
      await Promise.all([
        Player.findByIdAndUpdate(previousWinner, { $inc: { wins: -1 } }),
        Player.findByIdAndUpdate(previousLoser, { $inc: { losses: -1 } }),
      ]);
    }
    response.json(updated);
  }),
);
app.delete(
  "/api/battles/:id",
  requireAuth,
  asyncRoute(async (request, response) => {
    await Battle.findByIdAndDelete(request.params.id);
    response.status(204).end();
  }),
);
app.get(
  "/api/admin/overview",
  requireAuth,
  asyncRoute(async (_request, response) => {
    const [
      users,
      members,
      projects,
      articles,
      players,
      battles,
      memberDocs,
      projectDocs,
      articleDocs,
    ] = await Promise.all([
      User.countDocuments(),
      Member.countDocuments(),
      Project.countDocuments(),
      Article.countDocuments(),
      Player.countDocuments(),
      Battle.countDocuments(),
      Member.find().select("name socials videos createdAt").lean(),
      Project.find()
        .select("name clicks createdAt")
        .sort({ clicks: -1, createdAt: -1 })
        .lean(),
      Article.find().select("title createdAt").lean(),
    ]);
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        label: date
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", ""),
        date,
        value: 0,
      };
    });
    [...memberDocs, ...projectDocs, ...articleDocs].forEach((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      const day = days.find(
        (entry) =>
          createdAt && entry.date.toDateString() === createdAt.toDateString(),
      );
      if (day) day.value += 1;
    });
    const networkCounts = memberDocs
      .flatMap((member) => member.socials ?? [])
      .reduce<Record<string, number>>((result, social) => {
        const name = social.network || "Outras";
        result[name] = (result[name] ?? 0) + 1;
        return result;
      }, {});
    const activities = [
      ...memberDocs.map((item) => ({
        type: "Integrante",
        title: `${item.name} entrou para o grupo`,
        createdAt: item.createdAt,
      })),
      ...projectDocs.map((item) => ({
        type: "Projeto",
        title: `${item.name} foi atualizado`,
        createdAt: item.createdAt,
      })),
      ...articleDocs.map((item) => ({
        type: "Notícia",
        title: `${item.title} publicada`,
        createdAt: item.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      )
      .slice(0, 5);
    response.json({
      users,
      members,
      projects,
      articles,
      players,
      battles,
      videos: memberDocs.reduce(
        (total, member) => total + (member.videos?.length ?? 0),
        0,
      ),
      projectClicks: projectDocs.reduce(
        (total, project) => total + (project.clicks ?? 0),
        0,
      ),
      activityByDay: days.map(({ label, value }) => ({ label, value })),
      networks: Object.entries(networkCounts).map(([name, value]) => ({
        name,
        value,
      })),
      activities,
      topProjects: projectDocs
        .slice(0, 5)
        .map((project) => ({
          id: String(project._id),
          name: project.name,
          clicks: project.clicks ?? 0,
        })),
    });
  }),
);
app.post(
  "/api/projects/:id/visit",
  asyncRoute(async (request, response) => {
    const project = await Project.findByIdAndUpdate(
      request.params.id,
      { $inc: { clicks: 1 } },
      { new: true },
    ).select("clicks");
    if (!project)
      return response.status(404).json({ message: "Project not found." });
    response.json({ clicks: project.clicks });
  }),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) =>
    callback(null, file.mimetype.startsWith("image/")),
});
app.post(
  "/api/uploads",
  requireAuth,
  upload.single("file"),
  asyncRoute(async (request, response) => {
    if (!request.file)
      return response
        .status(400)
        .json({ message: "An image file is required." });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset)
      return response.status(503).json({
        message:
          "Image storage is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.",
      });
    const form = new FormData();
    form.set(
      "file",
      new Blob([request.file.buffer as unknown as BlobPart], {
        type: request.file.mimetype,
      }),
      request.file.originalname,
    );
    form.set("upload_preset", uploadPreset);
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form },
    );
    const result = (await cloudinaryResponse.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };
    if (!cloudinaryResponse.ok || !result.secure_url)
      return response
        .status(502)
        .json({ message: result.error?.message ?? "Image upload failed." });
    response.status(201).json({ url: result.secure_url });
  }),
);
app.use((_request, response) =>
  response.status(404).json({ message: "Route not found." }),
);

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET)
    throw new Error("MONGODB_URI and JWT_SECRET are required.");
  const dnsServers = process.env.DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`API listening on ${port}`));
}
start().catch((error) => {
  console.error(error);
  process.exit(1);
});
