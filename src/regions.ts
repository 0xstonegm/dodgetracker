export const supportedUserRegions = new Set(["eune", "euw", "kr", "na", "oce"]);

export function userRegionToRiotRegion(region: string): string {
    if (region === undefined) {
        throw new Error("Invalid region");
    }

    region = region.toLowerCase();
    switch (region) {
        case "eune":
            return "EUN1";
        case "euw":
            return "EUW1";
        case "kr":
            return "KR";
        case "na":
            return "NA1";
        case "oce":
            return "OC1";
        default:
            throw new Error("Invalid region");
    }
}

export function riotRegionToUserRegion(region: string): string {
    if (region === undefined) {
        throw new Error("Invalid region");
    }

    region = region.toUpperCase();
    switch (region) {
        case "EUN1":
            return "eune";
        case "EUW1":
            return "euw";
        case "KR":
            return "kr";
        case "NA1":
            return "na";
        case "OC1":
            return "oce";
        default:
            throw new Error("Invalid region");
    }
}
