export const seasons = [
  {
    label: "S2024 Split 2",
    value: "s14sp2",
    isCurrent: true,
    startDate: {
      EUW1: new Date("2024-05-15T11:00:00Z"),
      EUN1: new Date("2024-05-15T11:00:00Z"),
      KR: new Date("2024-05-15T04:00:00Z"),
      NA1: new Date("2024-05-15T19:00:00Z"),
      OC1: new Date("2024-05-15T03:00:00Z"),
    },
    endDate: {
      // FIXME: Update this later
      EUW1: new Date("2024-10-01T22:45:00Z"),
      EUN1: new Date("2024-10-01T22:45:00Z"),
      KR: new Date("2024-10-01T22:45:00Z"),
      NA1: new Date("2024-10-01T22:45:00Z"),
      OC1: new Date("2024-10-01T22:45:00Z"),
    },
  },
  {
    label: "S2024 Split 1",
    value: "s14sp1",
    isCurrent: false,
    startDate: {
      EUW1: new Date("2024-01-11T00:00:00Z"),
      EUN1: new Date("2024-01-11T00:00:00Z"),
      KR: new Date("2024-01-11T00:00:00Z"),
      NA1: new Date("2024-01-11T00:00:00Z"),
      OC1: new Date("2024-01-11T00:00:00Z"),
    },
    endDate: {
      EUW1: new Date("2024-05-14T22:45:00Z"),
      EUN1: new Date("2024-05-14T22:45:00Z"),
      KR: new Date("2024-05-14T15:45:00Z"),
      NA1: new Date("2024-05-15T04:45:00Z"),
      OC1: new Date("2024-05-14T14:45:00Z"),
    },
  },
] as const;

export function isCurrentSeason(seasonValue: string) {
  return seasons.find((season) => season.value === seasonValue)?.isCurrent;
}

export function getCurrentSeason() {
  return seasons.find((season) => season.isCurrent)!.value;
}
