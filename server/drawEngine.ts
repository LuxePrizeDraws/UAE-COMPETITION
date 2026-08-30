import { createHash } from 'crypto';
import nodemailer from 'nodemailer';
import {
  getAllEntryNumbers,
  getSoldEntries,
  recordDraw,
  resetCompetitionEntries,
  markWinnerNotified,
  generateSeed,
} from './database.js';

// ─── Email transporter ────────────────────────────────────────────────────────
// Uses any SMTP provider. Configure via env vars.
// Gmail: use an App Password (not your main password).
// For testing without email configured, winner details are logged to console.
function createTransporter() {
  if (!process.env.SMTP_HOST && !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── Provably fair draw ───────────────────────────────────────────────────────
// Uses a cryptographic seed + SHA-256 to pick a winner index.
// The seed is stored in the database so anyone can verify the draw was fair.
function pickWinner(entryNumbers: string[], seed: string): string {
  const hash = createHash('sha256').update(seed).digest('hex');
  // Convert first 8 hex chars to a number and use modulo to pick index
  const index = parseInt(hash.slice(0, 8), 16) % entryNumbers.length;
  return entryNumbers[index];
}

// ─── Draw engine ─────────────────────────────────────────────────────────────
export interface Competition {
  id: number;
  title: string;
  prizeAmount: number;
  currency: string;
  entryPrice: number;
  totalEntries: number;
}

export async function runDraw(competition: Competition): Promise<{
  winnerEntryNumber: string;
  drawId: number;
  seed: string;
}> {
  console.log(`\n🎯 DRAW TRIGGERED: ${competition.title}`);

  const entryNumbers = getAllEntryNumbers(competition.id);
  if (entryNumbers.length === 0) {
    throw new Error(`No entries found for competition ${competition.id}`);
  }

  // Generate cryptographic seed for provably fair draw
  const seed = generateSeed();
  const winnerEntryNumber = pickWinner(entryNumbers, seed);
  const totalRevenue = getSoldEntries(competition.id) * competition.entryPrice;

  console.log(`🏆 Winner entry: ${winnerEntryNumber}`);
  console.log(`📊 Total entries: ${entryNumbers.length} | Revenue: £${totalRevenue.toFixed(2)}`);
  console.log(`🔑 Draw seed (audit): ${seed}`);

  // Record in database
  const drawId = recordDraw({
    competitionId: competition.id,
    competitionTitle: competition.title,
    totalEntries: entryNumbers.length,
    totalRevenue,
    prizeAmount: competition.prizeAmount,
    currency: competition.currency,
    winnerEntryNumber,
    seed,
  });

  // Reset competition so it starts selling again immediately
  resetCompetitionEntries(competition.id);
  console.log(`🔄 Competition reset – now accepting new entries`);

  return { winnerEntryNumber, drawId, seed };
}

// ─── Send winner email ────────────────────────────────────────────────────────
export async function notifyWinner(params: {
  drawId: number;
  winnerEmail: string;
  winnerName: string;
  winnerEntryNumber: string;
  competitionTitle: string;
  prizeAmount: number;
  currency: string;
  seed: string;
}) {
  const transporter = createTransporter();

  const prizeFormatted = `£${params.prizeAmount.toLocaleString()}`;
  const subject = `🏆 YOU WON! ${params.competitionTitle} – ${prizeFormatted}`;
  const body = `
Hi ${params.winnerName || 'Winner'},

Congratulations! Your entry number ${params.winnerEntryNumber} was selected in the draw for:

  ${params.competitionTitle}
  Prize: ${prizeFormatted}

Your winning entry was selected using a provably fair cryptographic draw.
Draw verification seed: ${params.seed}

Our team will be in touch within 48 hours to arrange your prize.

UK Life Changing Competitions
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: params.winnerEmail,
        subject,
        text: body,
      });
      markWinnerNotified(params.drawId);
      console.log(`📧 Winner email sent to ${params.winnerEmail}`);
    } catch (err) {
      console.error('Failed to send winner email:', err);
    }
  } else {
    // No email configured — log to console so you can contact winner manually
    console.log('\n📧 EMAIL NOT CONFIGURED — Winner details:');
    console.log(`   Name:   ${params.winnerName || 'Unknown'}`);
    console.log(`   Email:  ${params.winnerEmail || 'Unknown'}`);
    console.log(`   Entry:  ${params.winnerEntryNumber}`);
    console.log(`   Prize:  ${prizeFormatted}`);
  }
}

// ─── Check & trigger draw ─────────────────────────────────────────────────────
// Called after every confirmed payment. Triggers draw if competition is full.
export async function checkAndTriggerDraw(
  competition: Competition,
  payerEmail?: string,
  payerName?: string
): Promise<{ drawn: boolean; winnerEntryNumber?: string }> {
  const sold = getSoldEntries(competition.id);
  const percent = (sold / competition.totalEntries) * 100;

  if (percent < 100) {
    return { drawn: false };
  }

  const { winnerEntryNumber, drawId, seed } = await runDraw(competition);

  // Notify winner if we have their email
  if (payerEmail) {
    await notifyWinner({
      drawId,
      winnerEmail: payerEmail,
      winnerName: payerName || '',
      winnerEntryNumber,
      competitionTitle: competition.title,
      prizeAmount: competition.prizeAmount,
      currency: competition.currency,
      seed,
    });
  }

  return { drawn: true, winnerEntryNumber };
}
