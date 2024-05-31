import { type MetadataRoute } from "next";
import { getAccounts } from "../data";
import { riotRegionToUserRegion, supportedUserRegions } from "../regions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.dodgetracker.com";

  const regions = Array.from(supportedUserRegions).map((region) => {
    return {
      url: `${baseUrl}/${region}`,
      lastModified: new Date(),
      changeFrequency: "always" as const, // Explicitly typing as a literal
      priority: 1,
    };
  });

  const leaderboards = Array.from(supportedUserRegions).map((region) => {
    return {
      url: `${baseUrl}/${region}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const, // Explicitly typing as a literal
      priority: 1,
    };
  });

  // const accounts = await getAccounts();
  const accounts = await (async function () {
    const accounts = await getAccounts();
    return accounts.map((account) => {
      return {
        url: encodeURI(
          `${baseUrl}/${riotRegionToUserRegion(account.riotRegion)}/${account.gameName}-${account.tagLine}`,
        ),
        lastModified: account.lastDodgeTime,
        changeFrequency: "hourly" as const, // Explicitly typing as a literal
        priority: 0.8,
      };
    });
  })();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...regions,
    ...leaderboards,
    ...accounts,
  ];
}
