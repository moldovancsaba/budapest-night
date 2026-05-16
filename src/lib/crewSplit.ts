/** Split a night-out total among the crew with tip and optional round-up per person. */
export function computeCrewSplit(
  subtotal: number,
  people: number,
  tipPercent: number,
  roundUp: boolean,
): {
  subtotal: number;
  tipAmount: number;
  grandTotal: number;
  perPerson: number;
  perPersonRaw: number;
} {
  const safePeople = Math.max(1, people);
  const tipAmount = Math.round(subtotal * (tipPercent / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + tipAmount) * 100) / 100;
  const perPersonRaw = grandTotal / safePeople;
  const perPerson = roundUp ? Math.ceil(perPersonRaw) : Math.round(perPersonRaw * 100) / 100;
  return { subtotal, tipAmount, grandTotal, perPerson, perPersonRaw };
}
