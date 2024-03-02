export const DUMP_IDENTATION: number = 4;

export const CONVERTED_SUFFIX: string = "_converted";
export const ARCHIVE_FOLDERNAME = "archives";

export const EXCLUDED_FILENAMES: Array<string | RegExp> = [
  // StartWith
  /^\..*/,
  /^_.*/
];

export const AUTO_TITLES: string[] = [
  // multi-lines

  // Legacy
  "Vie de famille",
  "Vie famille",
  "Photos en vrac",

  // Actuals
  "a trier",
  "a_trier",
  "Avec la tribu Honlet",
  "Avec la tribu Targé",
  "Avec les amis",
  "En famille",
  "En activité",

  // Other
  "_HDR"
].map((str) => str.toLowerCase());
