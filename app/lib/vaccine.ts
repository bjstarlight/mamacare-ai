export function getVaccines(age: string) {
  if (age.includes("6 week"))
    return "BCG, OPV1, Pentavalent1, PCV1, Rotavirus1";

  if (age.includes("10 week"))
    return "OPV2, Pentavalent2, PCV2, Rotavirus2";

  if (age.includes("14 week"))
    return "OPV3, Pentavalent3, PCV3, IPV";

  if (age.includes("9 month"))
    return "Measles, Yellow Fever";

  return "No scheduled vaccines.";
}