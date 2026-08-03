import { Schema, model } from "mongoose";

export const User = model(
  "User",
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ["admin"], default: "admin" },
    },
    { timestamps: true },
  ),
);
export const SiteSettings = model(
  "SiteSettings",
  new Schema(
    {
      name: { type: String, default: "OG Connect" },
      description: String,
      siteUrl: String,
      socials: [{ network: String, url: String }],
    },
    { timestamps: true },
  ),
);
export const Member = model(
  "Member",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      role: String,
      status: { type: String, enum: ["online", "offline"], default: "online" },
      description: String,
      specialty: String,
      imageUrl: String,
      bannerUrl: String,
      socials: [{ network: String, url: String }],
      projects: [String],
      videos: [{ title: String, url: String, thumbnailUrl: String }],
      featured: Boolean,
      displayOrder: { type: Number, default: 0 },
    },
    { timestamps: true },
  ),
);
export const Project = model(
  "Project",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: String,
      status: String,
      technologies: [String],
      imageUrl: String,
      imagePosition: { type: String, default: "50% 50%" },
      team: [String],
      links: [{ label: String, url: String }],
      ctaLabel: String,
      featured: { type: Boolean, default: false },
      featuredOrder: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      championshipId: { type: Schema.Types.ObjectId, ref: "Season" },
    },
    { timestamps: true },
  ),
);
export const Article = model(
  "Article",
  new Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      excerpt: String,
      content: String,
      category: String,
      coverUrl: String,
      featured: Boolean,
      publishedAt: Date,
    },
    { timestamps: true },
  ),
);
export const Season = model(
  "Season",
  new Schema(
    {
      name: String,
      number: Number,
      status: String,
      currentRound: String,
      imageUrl: String,
      startsAt: Date,
      endsAt: Date,
    },
    { timestamps: true },
  ),
);
export const Player = model(
  "Player",
  new Schema(
    {
      name: String,
      slug: { type: String, unique: true },
      avatarUrl: String,
      memberId: { type: Schema.Types.ObjectId, ref: "Member" },
      monotype: String,
      types: { type: [String], default: [] },
      color: String,
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      team: [{ pokemon: String, item: String, moves: [String] }],
    },
    { timestamps: true },
  ),
);
export const Battle = model(
  "Battle",
  new Schema(
    {
      seasonId: Schema.Types.ObjectId,
      playerA: { type: Schema.Types.ObjectId, ref: "Player" },
      playerB: { type: Schema.Types.ObjectId, ref: "Player" },
      winner: { type: Schema.Types.ObjectId, ref: "Player" },
      round: { type: String, default: "Rodada 1" },
      scheduledAt: Date,
      playedAt: Date,
      status: {
        type: String,
        enum: ["scheduled", "completed"],
        default: "scheduled",
      },
    },
    { timestamps: true },
  ),
);
export const Event = model(
  "Event",
  new Schema(
    {
      title: String,
      type: { type: String, enum: ["event", "live", "tournament"] },
      startsAt: Date,
      endsAt: Date,
      description: String,
      url: String,
    },
    { timestamps: true },
  ),
);
export const Media = model(
  "Media",
  new Schema(
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: {
        type: String,
        enum: ["image", "video", "document"],
        default: "image",
      },
      alt: String,
      size: Number,
    },
    { timestamps: true },
  ),
);
