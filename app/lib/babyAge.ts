export function calculateBabyAge(dob: string) {
  if (!dob) return "";

  const birth = new Date(dob);
  const today = new Date();

  const diff =
    today.getTime() - birth.getTime();

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  if (days < 30)
    return `${days} day(s)`;

  if (days < 365)
    return `${Math.floor(days / 7)} week(s)`;

  return `${Math.floor(days / 365)} year(s)`;
}