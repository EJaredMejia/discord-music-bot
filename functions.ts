import { Queue } from "distube";

export function verifiyQueue(queue: Queue | undefined) {
  if (!queue) {
    throw new Error("There is no song playing");
  }
}

export const printQueue = (queue: Queue) => {
  return `Current queue:\n${queue.songs
    .map(
      (song, id) =>
        `**${id ? id : "Playing"}**. ${song.name} - \`${
          song.formattedDuration
        }\``
    )
    .slice(0, 10)
    .join("\n")}`;
};

export const printHelp = () => {
  return `Commands:
!play or !p --- Play a song given a name or YT URL
!skip --- Skips the songs and plays the one in queue
!queue --- See all the songs in the queue
!leave --- bot leaves the voice chat
!pause --- Pause the song currently playing
!resume --- Resumes the song that was paused
!stop --- The bot stop all features`;
};

export function cleanUrl(urlString: string) {
  if (!urlString.includes("youtube.com")) {
    return urlString;
  }

  try {
    const url = new URL(urlString);

    const videoId = url.searchParams.get("v") ?? "";
    // Remove all query parameters
    url.search = "";

    const searchParams = new URLSearchParams([["v", videoId]]);

    return `${url.toString()}?${searchParams.toString()}`;
  } catch (err) {
    return urlString;
  }
}
