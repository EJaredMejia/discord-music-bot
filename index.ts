import { YouTubePlugin } from "@distube/youtube";
import Discord from "discord.js";
import { DisTube, Events } from "distube";
import * as dotenv from "dotenv";
import { printHelp, printQueue, verfiyQueue } from "./functions";

dotenv.config();

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const youtubePlugin = new YouTubePlugin();

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [youtubePlugin],
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot || !message.guild) return;

    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);

    if (!message.content.toLowerCase().startsWith(prefix)) return;
    //@ts-ignore
    await message.channel.sendTyping();

    const command = args.shift()?.toLowerCase();

    if (command === "help") {
      //@ts-ignore
      await message.channel.send(printHelp());
      return;
    }

    if (!message.member?.voice.channel) {
      throw new Error(`${message.author.username} is not on a voice channel`);
    }
    if (command === "play" || command === "p") {
      console.log("playing song");
      console.log(args);
      if (args.join(" ") === "") {
        throw new Error("Empty text is not a valid song");
      }

      await distube.play(message.member?.voice.channel, args.join(" "), {
        message,
        member: message.member,
      });
      return;
    }

    if (command === "skip") {
      const queue = await distube.getQueue(message);
      //@ts-ignore
      verfiyQueue(queue);

      //@ts-ignore
      if (queue?.songs.length <= 1) {
        //@ts-ignore
        throw new Error("Error: there is only one or none songs on the queue");
      }

      await distube.skip(message);
      return;
    }

    if (command === "queue") {
      console.log("printing queue");

      const queue = await distube.getQueue(message);
      if (!queue) {
        //@ts-ignore
        throw new Error("Nothing playing right now!");
      } else {
        //@ts-ignore
        await message.channel.send(printQueue(queue));
      }
      return;
    }

    if (command === "stop") {
      const queue = await distube.getQueue(message);
      //@ts-ignore
      verfiyQueue(queue);
      await distube.stop(message);
      //@ts-ignore
      message.channel.send("Stopped the music!");
      return;
    }

    if (command === "leave") {
      await distube.voices.get(message)?.leave();
      //@ts-ignore
      message.channel.send("Leaved the voice channel!");
      return;
    }

    if (command === "resume") {
      const queue = await distube.getQueue(message);
      //@ts-ignore
      verfiyQueue(queue);
      await distube.resume(message);
      return;
    }

    if (command === "pause") {
      const queue = await distube.getQueue(message);
      //@ts-ignore
      verfiyQueue(queue);
      await distube.pause(message);
      return;
    }

    //@ts-ignore
    await message.channel.send("Invalid command");
  } catch (error) {
    //@ts-expect-error
    await message.channel.send(error.message);
  }
});

client.on("voiceStateUpdate", (e) => {
  console.log({ e });
});

distube.on(Events.INIT_QUEUE, (queue) => {
  queue.volume = 100;
});

distube.on(Events.PLAY_SONG, (queue, song) => {
  try {
    queue.textChannel?.send("now playing: " + song.name);
  } catch (error) {
    console.log(error);
  }
});

distube.on(Events.ADD_SONG, (queue, song) => {
  try {
    queue.textChannel?.send("added to queue: " + song.name);
  } catch (error) {
    console.log(error);
  }
});

distube.on(Events.ADD_LIST, (queue, playlist) =>
  //@ts-ignore
  queue.textChannel?.send(
    `Added \`${playlist.name}\` playlist (${
      playlist.songs.length
    } songs) to queue\n${printQueue(queue)}`
  )
);

client.on("error", (e) => {
  console.log(e);
});

client.login(process.env.DISCORD_TOKEN).then(() => {
  console.log("running");
});
