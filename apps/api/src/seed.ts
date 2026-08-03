import 'dotenv/config';
import bcrypt from 'bcryptjs';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { Article, Event, Member, Player, Project, Season, User } from './models.js';

async function seed() {
  const dnsServers = process.env.DNS_SERVERS?.split(',').map(server => server.trim()).filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);
  await mongoose.connect(process.env.MONGODB_URI!);
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'change-me-now', 12);
  await User.updateOne({ email: 'admin@grupomais.gg' }, { email: 'admin@grupomais.gg', passwordHash, role: 'admin' }, { upsert: true });
  await Member.bulkWrite([{ updateOne: { filter: { slug: 'kai-oliveira' }, update: { name: 'Kai Oliveira', slug: 'kai-oliveira', specialty: 'Minecraft & comunidade', description: 'Fundador e streamer.', featured: true }, upsert: true } }]);
  await Project.bulkWrite([{ updateOne: { filter: { slug: 'liga-cobblemon' }, update: { name: 'Liga Cobblemon', slug: 'liga-cobblemon', status: 'Temporada 03', technologies: ['Cobblemon', 'Discord'], description: 'Campeonato competitivo da comunidade.' }, upsert: true } }]);
  await Player.bulkWrite([{ updateOne: { filter: { slug: 'niko' }, update: { name: 'Niko', slug: 'niko', monotype: 'Elétrico', types: ['Elétrico', 'Voador'], color: '#F59E0B', wins: 9, losses: 1 }, upsert: true } }]);
  await Article.bulkWrite([{ updateOne: { filter: { slug: 'semifinais-definidas' }, update: { title: 'Cobblemon Championship: semifinais definidas', slug: 'semifinais-definidas', category: 'Campeonato', excerpt: 'A reta final começou.', publishedAt: new Date() }, upsert: true } }]);
  await Event.bulkWrite([{ updateOne: { filter: { title: 'Final da Liga Cobblemon' }, update: { title: 'Final da Liga Cobblemon', type: 'tournament', startsAt: new Date('2026-08-16T22:00:00Z') }, upsert: true } }]);
  await Season.updateOne({ number: 3 }, { name: 'Cobblemon Championship', number: 3, status: 'active', currentRound: 'Semifinais' }, { upsert: true });
  await mongoose.disconnect(); console.log('Seed completed.');
}
seed().catch(error => { console.error(error); process.exit(1); });
