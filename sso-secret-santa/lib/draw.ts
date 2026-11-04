/**
 * Pure assignment engine. Server-only caller must validate exchange membership,
 * participant status, draw state, and exclusion pairs before invoking this function.
 * For n participants, this finds a randomized perfect matching with backtracking.
 * It terminates deterministically on impossible inputs rather than retrying forever.
 */
export type Pairing = { giverId: string; recipientId: string };
export function createSecretSantaDraw(
  participantIds: string[],
  exclusions: Array<[string, string]>,
  random: () => number = Math.random
): Pairing[] {
  const ids = [...new Set(participantIds)];
  if (ids.length !== participantIds.length) throw new Error("Duplicate participant IDs.");
  if (ids.length < 2) throw new Error("At least two participants are required.");
  const blocked = new Set<string>();
  for (const [a, b] of exclusions) {
    if (a === b) throw new Error("A participant cannot be excluded from themselves.");
    blocked.add(`${a}::${b}`); blocked.add(`${b}::${a}`);
  }
  const shuffled = <T,>(arr: T[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  // Randomize giver order and candidate preference. Backtracking avoids infinite loops.
  const givers = shuffled(ids);
  const recipientByGiver = new Map<string, string>();
  const used = new Set<string>();
  const candidates = new Map(givers.map(g => [g, shuffled(ids.filter(r => r !== g && !blocked.has(`${g}::${r}`)))]));
  const search = (index: number): boolean => {
    if (index === givers.length) return true;
    const giver = givers[index];
    for (const recipient of candidates.get(giver) ?? []) {
      if (used.has(recipient)) continue;
      recipientByGiver.set(giver, recipient); used.add(recipient);
      if (search(index + 1)) return true;
      recipientByGiver.delete(giver); used.delete(recipient);
    }
    return false;
  };
  if (!search(0)) throw new Error("No valid draw exists with these exclusions.");
  return givers.map(giverId => ({ giverId, recipientId: recipientByGiver.get(giverId)! }));
}
