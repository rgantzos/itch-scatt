const { MongoClient, ServerApiVersion } = require("mongodb");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const {
  Routes,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  Client,
  ActionRowBuilder,
  MessageSelectMenu,
  ButtonBuilder,
  WebhookClient,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  Partials,
} = require("discord.js");
const { exec } = require("child_process");
const { REST } = require("@discordjs/rest");
const rest = new REST({ version: "10" }).setToken(process.env.token);
const scatt = {
  emojis: {
    successful: "<:successful:1043300109921829054>",
    unsuccessful: "<:unsuccessful:1043300105450696765>",
  },
  autoReacts: {
    "<@948687053896433714>": "❤️",
    scratchtools: "<:scratchtools:988978116187799583>",
  },
  channels: {
    server_changes: "1043042679111561257",
    modmail: "954823644415135826",
    cookieboard: "955181553535832145",
    logs: "1046079063447584849",
    info: "945342441987391548",
    bots: "964549623375101962",
    welcome: "945348575083233290",
    welcoming: "973239218518245386",
    staff_cmd: "945351020530245652",
    counting: "945352412779126885",
  },
  min_reactions: 4,
  rgantzos: "810336621198835723",
  cookieCamper: {
    minimumRank: 25,
    role: "976671111372759070",
    main_channel: "1043218898901799053",
  },
  top_member: {
    role: "1043681441327874078",
    count: 5,
  },
  server: "945340853189247016",
  ping_roles: {
    scratch: "978771942981132368",
    developer: "978771991551180890",
    games: "978772038154088472",
    updates: "1018005551675879454",
    random: "1043354855617597461",
  },
  active: {
    minimum: 50,
    role: "1043052399943761980",
  },
  moderator: "961725317427384442",
  whitelist: [
    "fart",
    "sex",
    "sexy",
    "hell",
    "poop",
    "porn",
    "preteen",
    "p0rn",
    "screw",
    "screwing",
  ],
};
const dbClient = new MongoClient(process.env.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
scatt.discordJs = require("discord.js");

const { CronJob } = require("cron");

async function weeklyActive() {
  var lb = await getWeeklyLeaderboard();
  var info = await client.channels.fetch(scatt.channels.info);
  var guild = info.guild;
  var role = await guild.roles.fetch(scatt.active.role);
  lb.forEach(async function (el, i) {
    try {
      var member = await guild.members.fetch(el.id);
      if (member) {
        if (i < scatt.active.minimum) {
          if (
            !member.roles.cache.some((role) => role.id === scatt.active.role)
          ) {
            await member.roles.add(role, "Top 50 on leaderboard.");
          }
        } else {
          if (
            member.roles.cache.some((role) => role.id === scatt.active.role)
          ) {
            await member.roles.remove(role, "No longer top 50 on leaderboard.");
          }
        }

        var nextRole = await guild.roles.fetch(scatt.top_member.role);
        if (i < scatt.top_member.count) {
          var member = await guild.members.fetch(el.id);
          if (
            !member.roles.cache.some(
              (role) => role.id === scatt.top_member.role
            )
          ) {
            await member.roles.add(nextRole, "Top 3 on leaderboard.");
          }
        } else {
          if (
            member.roles.cache.some((role) => role.id === scatt.top_member.role)
          ) {
            await member.roles.remove(
              nextRole,
              "No longer top 3 on leaderboard."
            );
          }
        }
      }
    } catch (err) {}
  });
  var members = await dbClient
    .db("Scatt")
    .collection("weekly")
    .find({})
    .toArray();
  members.forEach(async function (el) {
    await dbClient
      .db("Scatt")
      .collection("weekly")
      .updateOne({ id: el.id }, { $set: { xp: 0 } }, { upsert: true });
  });
}

let getWeeklyActive = new CronJob("0 0 * * 0,3", weeklyActive);
getWeeklyActive.start();

let getUserCountForChannelName = new CronJob("*/10 * * * *", async function () {
  var response = await fetch(
    "https://raw.githubusercontent.com/STForScratch/website2/main/data/usercount.json"
  );
  var data = await response.json();
  var channel = await client.channels.fetch("961650991151845398");
  await channel.setName(`🍪 Welcome - ${data.count.toString()} Users`);
});
getUserCountForChannelName.start();

async function resetCookieCampers() {
  var lb = await getLeaderboard();
  var actuallySupposedTo = [];
  lb.forEach(function (el, i) {
    if (i < scatt.cookieCamper.minimumRank) {
      actuallySupposedTo.push(el.id);
    }
  });
}

const client = new scatt.discordJs.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
  fetchAllMembers: true,
  presence: {
    status: "ONLINE",
    activities: [
      {
        name: `ScratchTools`,
        type: "WATCHING",
      },
    ],
  },
});

function getConfigurationEmbed(full) {
  if (full) {
    var channelText = ``;
    Object.keys(scatt.channels).forEach(function (el) {
      if (channelText !== "") {
        channelText =
          channelText +
          `\n${(el[0].toUpperCase() + el.substring(1)).replaceAll(
            "_",
            " "
          )}: <#${scatt.channels[el]}>`;
      } else {
        channelText =
          channelText +
          `${(el[0].toUpperCase() + el.substring(1)).replaceAll("_", " ")}: <#${
            scatt.channels[el]
          }>`;
      }
    });
    var roleText = ``;
    Object.keys(scatt.ping_roles).forEach(function (el) {
      if (roleText !== "") {
        roleText =
          roleText +
          `\n${(el[0].toUpperCase() + el.substring(1)).replaceAll(
            "_",
            " "
          )}: <@&${scatt.ping_roles[el]}>`;
      } else {
        roleText =
          roleText +
          `${(el[0].toUpperCase() + el.substring(1)).replaceAll(
            "_",
            " "
          )}: <@&${scatt.ping_roles[el]}>`;
      }
    });
  }
  var config = new EmbedBuilder()
    .setTitle("🔧 Configurations")
    .addFields(
      {
        name: "Bot",
        value: `<@${client.user.id}> (${client.user.tag})`,
        inline: false,
      },
      { name: "Moderator", value: `<@&${scatt.moderator}>`, inline: false },
      {
        name: "Cookie Camper",
        value: `Role: <@&${
          scatt.cookieCamper.role
        }>\nMinimum Rank: ${scatt.cookieCamper.minimumRank.toString()}\nChannel: <#${
          scatt.cookieCamper.main_channel
        }>`,
        inline: false,
      },
      {
        name: "Active Member",
        value: `Role: <@&${
          scatt.active.role
        }>\nMinimum Rank: ${scatt.active.minimum.toString()}`,
        inline: false,
      },
      {
        name: "Top Member",
        value: `Role: <@&${
          scatt.top_member.role
        }>\nCount: ${scatt.top_member.count.toString()}`,
        inline: false,
      }
    )
    .setThumbnail(client.user.avatarURL());
  if (full) {
    config.addFields(
      { name: "Channels", value: channelText, inline: false },
      { name: "Roles", value: roleText, inline: false }
    );
  }
  return config;
}

async function main() {
  try {
    await dbClient.connect();
    console.log("Connected to database.");
    try {
      if (!client.user) {
        console.log("Unable to connect to Discord. Killing and trying again.");
        exec("kill 1");
      }
    } catch (err) {
      console.log("Unable to connect to Discord. Killing and trying again.");
      exec("kill 1");
    }
  } catch (err) {
    console.log("Unable to connect to database. Killing and trying again.");
    exec("kill 1");
  }
}
main();

scatt.log = async function (message) {
  var channel = await client.channels.fetch(scatt.channels.logs);
  message.allowedMentions = { users: [] };
  channel.send(message);
};

let getDailyUsers = new CronJob("0 8 * * *", getDaily);
getDailyUsers.start();
async function getDaily() {
  var members = await dbClient
    .db("Scatt")
    .collection("daily")
    .find({})
    .toArray();
  var spoken = [];
  members.forEach(function (el) {
    if (el.messages !== 0 && !spoken.includes(el.id)) {
      spoken.push(el.id);
    }
  });
  var dailyMembers = `:white_sun_small_cloud: Today, ${spoken.length.toString()} were chatting! They were:\n\n- <@${spoken.join(
    ">\n- <@"
  )}>`;
  scatt.log({ content: dailyMembers });
  members.forEach(async function (el) {
    await dbClient
      .db("Scatt")
      .collection("daily")
      .updateOne({ id: el.id }, { $set: { messages: 0 } }, { upsert: true });
  });
}

const viewWarns = new SlashCommandBuilder()
  .setName("view-warns")
  .setDescription("View your warnings.");
const config = new SlashCommandBuilder()
  .setName("config")
  .setDescription("View the configurations for Scatt.");

const roles = new SlashCommandBuilder()
  .setName("roles")
  .setDescription("Select your ping roles for the server.")
  .addBooleanOption((option) =>
    option
      .setName("updates")
      .setDescription("These pings include changes for ScratchTools.")
  )
  .addBooleanOption((option) =>
    option
      .setName("games")
      .setDescription(
        "These pings include games going on in the server that you can play."
      )
  )
  .addBooleanOption((option) =>
    option
      .setName("scratch")
      .setDescription("These pings include news for the Scratch website.")
  )
  .addBooleanOption((option) =>
    option
      .setName("developer")
      .setDescription(
        "These pings include news for developers, or cool projects to contribute to."
      )
  )
  .addBooleanOption((option) =>
    option
      .setName("random")
      .setDescription("These pings include other random stuff.")
  );

const xp = new SlashCommandBuilder()
  .setName("xp")
  .setDescription("Do stuff with XP.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rank")
      .setDescription("Get your XP rank!")
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to view the status of.")
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("leaderboard").setDescription("View the XP leaderboard!")
  );

const invite = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Invite a member to become a developer.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("member")
      .setDescription("The member to invite.")
      .setRequired(true)
  );

const say = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Say something in the channel using Scatt.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName("content")
      .setDescription("The content to send.")
      .setRequired(true)
  );

const isbadword = new SlashCommandBuilder()
  .setName("is-bad-word")
  .setDescription("Check if something includes a bad word.")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("The content to check.")
      .setRequired(true)
  );

const modmail = new SlashCommandBuilder()
  .setName("modmail")
  .setDescription("Deal with modmails.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("open")
      .setDescription("Open a modmail.")
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to open a modmail with.")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("close")
      .setDescription("Close the modmail.")
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription(
            "Why you're closing the modmail, or any final remarks."
          )
          .setRequired(false)
      )
  );

const warnings = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("Do stuff with warnings.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Warn a user.")
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to warn.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Why to warn them.")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("view")
      .setDescription("View somebody's warnings!")
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to warn.")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove somebody's warning!")
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to remove the warn from.")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("warning")
          .setDescription("The warning to remove.")
          .setRequired(true)
      )
  );

client.on("ready", async function () {
  console.log("Logged in as " + client.user.tag + "!");
  await rest.put(Routes.applicationCommands(client.user.id), {
    body: [
      xp,
      warnings,
      viewWarns,
      roles,
      invite,
      modmail,
      say,
      isbadword,
      config,
    ],
  });
  //resetCookieCampers()
  //weeklyActive()
  var channel = await client.channels.fetch(scatt.channels.info);
  var mainEmbed = new EmbedBuilder()
    .setTitle("Welcome to the ScratchTools Server!")
    .setColor("Blue")
    .setDescription(
      "We're glad to have you here! Take a look around, make suggestions, get help with projects, or just have fun! Thanks for joining, and we recommend using or contributing to ScratchTools!"
    );
  var rulesEmbed = new EmbedBuilder()
    .setTitle("Server Rules")
    .setDescription(
      `
**1) Respect everyone.**
    This server is for both the developers working on the features, AND the community who is interested in it. Please treat both with respect. This is similar to Rule #3.

**2) No inappropriate content.**
Please keep the server SFW. We want all members of the server to feel comfortable here. Please don't use offensive curse words (slight cursing is okay as long as it's used rarely, but no major cursing), either.

**3) Keep it safe for everyone.**
This needs to be a safe space for everyone. Don't disrespect people based on their race, gender identity, sexual orientation, or other personal factors. We want to make sure that everyone feels included and can safely enjoy this server with everyone else.

**4) No spam, please.**
No spamming. That's not fun for anybody. Especially not when you're doing it just to get onto the leaderboard. Try hosting a conversation in general! That's where you can have fun! Also no pinging a lot, please.

**5) Use channels appropriately.**
Please use channels as intended. For example, please keep advertisements in advertise. Please keep most bot commands in bots-n-stuff. This will keep the server clean for everyone to use and enjoy.

**6) Enjoy yourself.**
Have a great time! We will talk about new features in the New Features stage from time to time! Go grab some roles in roles!

**7) Leave the drama outside.**
Don't bring drama into the server with you. It's fine to share opinions, but make sure that what you're saying isn't too controversial and that it won't start any large arguments that could disrupt the rest of the server.

**8) Use simple nicknames.**
Please make your nickname easy to ping, and easy for anyone to type. If you have a username that isn't easy to type/ping, then we will give you a nickname. If you want to choose it yourself, feel free to set your own nickname.

**9) Respect moderator actions.**
Please understand the actions that our moderators take to keep the server safe. If there's something that a moderator does that you don't agree with, DM an admin privately, don't make a big deal about it in the server.

**10) Use Common Sense.**
These rules aren’t meant to be tiring and mods reserve the right to punish you for reasons outside of these rules.`
    )
    .setColor("Blue");
  var getRoles = new EmbedBuilder()
    .setTitle("How to Get Roles")
    .setDescription(
      "Simply use `/roles` in any channel of the ScratchTools server! Then you can easily pick your roles for the server!"
    )
    .setColor("Blue");
  var components = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Website")
      .setStyle("Link")
      .setURL("https://scratchtools.app"),
    new ButtonBuilder()
      .setLabel("YouTube")
      .setStyle("Link")
      .setURL("https://youtube.com/@scratchtools"),
    new ButtonBuilder()
      .setLabel("GitHub")
      .setStyle("Link")
      .setURL("https://github.com/STForScratch/ScratchTools"),
    new ButtonBuilder()
      .setLabel("Docs")
      .setStyle("Link")
      .setURL("https://docs.scratchtools.app")
  );
  //await channel.send({embeds:[mainEmbed]})
  //await channel.send({embeds:[rulesEmbed]})
  //await channel.send({embeds:[getRoles]})
  //await channel.send({components:[components]})
});

client.on("guildMemberRemove", async function (member) {
  if (member.guild.id === scatt.server) {
    var logs = await client.channels.fetch(scatt.channels.logs);
    logs.send({
      content: `<:goodbye:1043391556553555978> <@${member.id}> just left.`,
    });
  }
});

async function getLeaderboard() {
  var topXp = [];
  var topUsers = [];
  var topAll = [];
  var members = await dbClient
    .db("Scatt")
    .collection("userdata")
    .find({})
    .toArray();
  var alreadyIDs = [];
  var newMembers = [];
  members.forEach(function (el) {
    if (!alreadyIDs.includes(el.id)) {
      alreadyIDs.push(el.id);
      newMembers.push(el);
    }
  });
  members = newMembers;
  members.forEach(function (el) {
    topXp.push(el.xp);
  });
  topXp.sort(function (a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  topXp.forEach(function (el) {
    var addedAlready = false;
    members.forEach(function (user) {
      if (!addedAlready && user.xp === el && !user.taken) {
        alreadyAdded = true;
        user.taken = true;
        topUsers.push(user.id);
        topAll.push({ id: user.id, xp: user.xp });
      }
    });
  });
  return topAll.reverse();
}

async function getWeeklyLeaderboard() {
  var topXp = [];
  var topUsers = [];
  var topAll = [];
  var members = await dbClient
    .db("Scatt")
    .collection("weekly")
    .find({})
    .toArray();
  var alreadyIDs = [];
  var newMembers = [];
  members.forEach(function (el) {
    if (!alreadyIDs.includes(el.id)) {
      alreadyIDs.push(el.id);
      newMembers.push(el);
    }
  });
  members = newMembers;
  members.forEach(function (el) {
    topXp.push(el.xp);
  });
  topXp.sort(function (a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  topXp.forEach(function (el) {
    var addedAlready = false;
    members.forEach(function (user) {
      if (!addedAlready && user.xp === el && !user.taken) {
        alreadyAdded = true;
        user.taken = true;
        topUsers.push(user.id);
        topAll.push({ id: user.id, xp: user.xp });
      }
    });
  });
  return topAll.reverse();
}

client.on("guildMemberAdd", async function (member) {
  if (member.guild.id === scatt.server) {
    var possibleMessages = [
      `Woah, let's welcome <@${member.user.id}> to the best server ever!`,
      `Wow!!! It's the real <@${member.user.id}>!! Welcome!`,
      `This server just keeps growing! C'mon everyone, let's welcome <@${member.user.id}>!`,
      `Hi, <@${member.user.id}>. Nice to meet you- I'm Scatt.`,
      `New server member!! Everybody welcome <@${member.user.id}>!`,
      `Is that <@${member.user.id}> I see? Yes, yes it is! Welcome!`,
      `Look at that, a new server member! Welcome to the server, <@${member.user.id}>!`,
      `Everybody welcome my brand new bestie, <@${member.user.id}>!`,
    ];
    var welcomeChannel = await client.channels.fetch(scatt.channels.welcome);
    welcomeChannel.send({
      content:
        "<:welcome:1043391559380516864> " +
        possibleMessages[Math.floor(Math.random() * possibleMessages.length)],
    });
    var gotit = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("gotit")
        .setLabel("I Will Welcome Them")
        .setStyle("Primary")
        .setDisabled(false)
    );
    var banana = await client.channels.fetch(scatt.channels.welcoming);
    await banana.send({
      content: `<@&973238564034859109> - <@${member.user.id}> just joined!`,
      components: [gotit],
    });
  }
});

client.on("messageDelete", async function (message) {
  try {
    if (message.author && !message.author.bot) {
      if (message.content) {
        scatt.log({
          content: `🗑️ <@${message.author.id}> had their message deleted in <#${
            message.channel.id
          }>:\n\n${message.content.toString()}`,
          files: message.attachments.map((attachment) => attachment),
        });
      } else {
        scatt.log({
          content: `🗑️ <@${message.author.id}> had their message deleted in <#${message.channel.id}>:`,
          files: message.attachments.map((attachment) => attachment),
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

client.on("messageCreate", async function (message) {
  if (message.channel.id === scatt.channels.counting) {
    if (
      message.content &&
      message.content !== "" &&
      message.content.match(/^[0-9]+$/)
    ) {
      var tried = Number(message.content);
      var oldNumber = await dbClient
        .db("Scatt")
        .collection("counting")
        .find({})
        .toArray();
      if (!oldNumber || oldNumber.length === 0) {
        await dbClient.db("Scatt").collection("counting").insertOne({
          user: client.user.id,
          number: 0,
        });
        oldNumber = [{ number: 0 }];
      }
      if (oldNumber[0].number + 1 === tried) {
        if (oldNumber[0].user !== message.author.id) {
          message.react(scatt.emojis.successful);
          dbClient
            .db("Scatt")
            .collection("counting")
            .updateOne(
              { number: oldNumber[0].number },
              { $set: { number: tried, user: message.author.id } },
              { upsert: true }
            );
        } else {
          message.react(scatt.emojis.unsuccessful);
          message.reply({
            content:
              "You can't count twice in a row! Alright, we're starting back at 1.",
          });
          dbClient
            .db("Scatt")
            .collection("counting")
            .updateOne(
              { number: oldNumber[0].number },
              { $set: { number: 0, user: client.user.id } },
              { upsert: true }
            );
          var recordDB = await dbClient
            .db("Scatt")
            .collection("records")
            .findOne({ name: "Highest Counting" });
          if (recordDB) {
            if (recordDB.value < oldNumber[0].number) {
              var channel = await client.channels.fetch(
                scatt.channels.server_changes
              );
              dbClient
                .db("Scatt")
                .collection("records")
                .updateOne(
                  { name: "Highest Counting" },
                  { $set: { value: oldNumber[0].number } },
                  { upsert: true }
                );
              channel.send({
                content: `<:st_emoji_party:1008191843281936414> Wow, we just broke the record for highest number in <#${scatt.channels.counting}>! We made it all the way to ${oldNumber[0].number}!!`,
              });
            }
          } else {
            await dbClient.db("Scatt").collection("records").insertOne({
              name: "Highest Counting",
              value: oldNumber[0].number,
              holder: client.user.id,
            });
          }
        }
      } else {
        message.react(scatt.emojis.unsuccessful);
        message.reply({
          content: "That's the wrong number! We're starting back at 1 now.",
        });
        dbClient
          .db("Scatt")
          .collection("counting")
          .updateOne(
            { number: oldNumber[0].number },
            { $set: { number: 0, user: client.user.id } },
            { upsert: true }
          );
        var recordDB = await dbClient
          .db("Scatt")
          .collection("records")
          .findOne({ name: "Highest Counting" });
        if (recordDB) {
          if (recordDB.value < oldNumber[0].number) {
            var channel = await client.channels.fetch(
              scatt.channels.server_changes
            );
            dbClient
              .db("Scatt")
              .collection("records")
              .updateOne(
                { name: "Highest Counting" },
                { $set: { value: oldNumber[0].number } },
                { upsert: true }
              );
            channel.send({
              content: `<:st_emoji_party:1008191843281936414> Wow, we just broke the record for highest number in <#${scatt.channels.counting}>! We made it all the way to ${oldNumber[0].number}!!`,
            });
          }
        } else {
          await dbClient.db("Scatt").collection("records").insertOne({
            name: "Highest Counting",
            value: oldNumber[0].number,
            holder: client.user.id,
          });
        }
      }
    }
  }
  if (!message.author.bot && message.channel.type !== 1) {
    function isNumeric(str) {
      if (typeof str != "string") return false; // we only process strings!
      return (
        !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
      ); // ...and ensure strings of whitespace fail
    }
    if (
      isNumeric(message.channel.name) &&
      message.channel.parentId === scatt.channels.modmail &&
      message.content &&
      message.content !== "" &&
      !message.content.startsWith("\\")
    ) {
      var user = await client.users.fetch(message.channel.name);
      if (user) {
        await user.send({
          content: `\`${message.author.tag}\` ` + message.content,
          files: message.attachments.map((attachment) => attachment),
          username: message.author.username,
          avatarURL: message.author.avatarURL(),
          embeds: [],
        });
        message.react("<:successful:1043300109921829054>");
      } else {
        message.react("<:unsuccessful:1043300105450696765>");
      }
    }
    var user = await dbClient
      .db("Scatt")
      .collection("userdata")
      .findOne({ id: message.author.id });
    var weeklyUser = await dbClient
      .db("Scatt")
      .collection("weekly")
      .findOne({ id: message.author.id });
    if (user && user.xp) {
      var oldLevel = Math.floor(user.xp / 1500);
      await dbClient
        .db("Scatt")
        .collection("userdata")
        .updateOne(
          { id: message.author.id },
          { $set: { xp: user.xp + 28 } },
          { upsert: true }
        );
      var newLevel = Math.floor((user.xp + 28) / 1500);
      if (newLevel > oldLevel) {
        var upgradeEmbed = new EmbedBuilder()
          .setTitle(`🎉 ${message.author.tag} Just Leveled Up!`)
          .setColor("Gold")
          .setDescription(
            "Congrats to <@" +
              message.author.id +
              ">, who just reached **level " +
              newLevel.toString() +
              "**!!!"
          )
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.avatarURL(),
          })
          .setThumbnail(message.author.avatarURL());
        var botsChannel = await client.channels.fetch(scatt.channels.bots);
        botsChannel.send({ embeds: [upgradeEmbed] });
      }
      if (message.guild.id === scatt.server) {
        var member = message.member;
        var roles = await message.guild.roles.fetch();
        const role = roles.find((role) =>
          role.name.toLowerCase().includes("cookie camper")
        );
        if (
          !message.member.roles.cache.some(
            (role) => role.name === "Cookie Camper"
          )
        ) {
          var leaderboard = await getLeaderboard();
          leaderboard.forEach(async function (el, i) {
            if (
              el.id === message.author.id &&
              i < scatt.cookieCamper.minimumRank
            ) {
              await member.roles.add(role, "Top 25 on leaderboard.");
              var embed = new EmbedBuilder()
                .setTitle("🍪 Welcome to the Cookie Campers!")
                .setDescription(
                  "You're at this *exclusive* camp now because you're in the top 25 on the leaderboard! Congrats!"
                )
                .setAuthor({
                  name: message.author.username,
                  iconURL: message.author.avatarURL(),
                })
                .setThumbnail(message.author.avatarURL());
              var channel = await client.channels.fetch(
                scatt.cookieCamper.main_channel
              );
              channel.send({
                embeds: [embed],
                content: `<@${message.author.id}>`,
              });
            }
          });
        }
      }
    } else {
      var newUser = {
        id: message.author.id,
        xp: 28,
      };
      await dbClient.db("Scatt").collection("userdata").insertOne(newUser);
    }
    if (weeklyUser && weeklyUser.xp) {
      await dbClient
        .db("Scatt")
        .collection("weekly")
        .updateOne(
          { id: message.author.id },
          { $set: { xp: weeklyUser.xp + 28 } },
          { upsert: true }
        );
    } else {
      var newUser = {
        id: message.author.id,
        xp: 28,
      };
      await dbClient.db("Scatt").collection("weekly").insertOne(newUser);
    }
    var dailyUser = await dbClient
      .db("Scatt")
      .collection("daily")
      .findOne({ id: message.author.id });
    if (dailyUser) {
      await dbClient
        .db("Scatt")
        .collection("daily")
        .updateOne(
          { id: message.author.id },
          { $set: { messages: dailyUser.messages + 1 } },
          { upsert: true }
        );
    } else {
      await dbClient
        .db("Scatt")
        .collection("daily")
        .insertOne({ id: message.author.id, messages: 1 });
    }
    if (message.channel.parentId !== scatt.channels.modmail) {
      var response = await fetch(
        "https://raw.githubusercontent.com/web-mech/badwords/master/lib/lang.json"
      );
      var data = await response.json();
      var deleteMessage = false;
      var whitelist = scatt.whitelist;
      data.words.forEach(function (el) {
        if (
          message.content &&
          (message.content.toLowerCase().includes(" " + el + " ") ||
            message.content.toLowerCase().startsWith(el + " ") ||
            message.content.toLowerCase().endsWith(" " + el) ||
            message.content.toLowerCase() === el) &&
          !whitelist.includes(el)
        ) {
          deleteMessage = true;
        }
      });
      if (deleteMessage) {
        var logs = await client.channels.fetch(scatt.channels.logs);
        var msg = await logs.send({
          content: `<@${message.author.id}> just got blocked and warned for saying: ${message.content}`,
        });
        message.channel.send({
          content: `<:unsuccessful:1043300105450696765> <@${message.author.id}>, watch your language!`,
        });
        var warning = {
          reason: `Cursing: ${msg.url}.`,
          moderator: client.user.id,
        };
        var userWarnings = await dbClient
          .db("Scatt")
          .collection("warnings")
          .findOne({ id: message.author.id });
        if (userWarnings) {
          userWarnings.warnings.push(warning);
          await dbClient
            .db("Scatt")
            .collection("warnings")
            .updateOne(
              { id: message.author.id },
              { $set: { warnings: userWarnings.warnings } },
              { upsert: true }
            );
        } else {
          await dbClient
            .db("Scatt")
            .collection("warnings")
            .insertOne({ id: message.author.id, warnings: [warning] });
        }
        message.author.send({
          content:
            "<:unsuccessful:1043300105450696765> Please remember to watch your language in the ScratchTools server, we'd like to keep it safe for everyone. We warned you for breaking the server rules, but feel free to appeal by DMing me if you think it was a mistake.",
        });
        message.delete();
      }
    }
  } else {
    if (
      message.author.id !== client.user.id &&
      !message.webhookId &&
      !message.author.bot
    ) {
      var modmailChannel = await client.channels.fetch(scatt.channels.modmail);
      var existingModmail = await modmailChannel.threads.cache.find(
        (x) => x.name === message.author.id
      );
      if (existingModmail) {
        if (message.content && message.content !== "") {
          var webhook = new WebhookClient({
            url: "https://discord.com/api/webhooks/1002257663771549736/K8uu6rN-y9ZleUHKQALT35CkW4hzW6DctGfkeOuWm1Wuz_fvTq5YQe2yXGjAMF1QopaI",
          });
          await webhook.send({
            content: message.content,
            files: message.attachments.map((attachment) => attachment),
            username: message.author.username,
            avatarURL: message.author.avatarURL(),
            embeds: [],
            threadId: existingModmail.id,
          });
          message.react("<:successful:1043300109921829054>");
        } else {
          message.react("<:unsuccessful:1043300105450696765>");
        }
      } else {
        var startModmail = new EmbedBuilder()
          .setTitle("ScratchTools Modmail")
          .setDescription(
            "If you would like to have a private conversation with our moderation team via Scatt, click the button below to open a modmail. Your messages will then be relayed through Scatt to our mod team."
          )
          .setColor("Blurple");
        var row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Start Modmail")
            .setCustomId("startmodmail")
            .setEmoji("👥")
        );
        message.reply({ embeds: [startModmail], components: [row] });
      }
    }
  }
});

client.on("messageReactionRemove", async function (reaction, user) {
  try {
    if (reaction._emoji.name === "🍪") {
      await reaction.fetch();
      var existingMessage = await dbClient
        .db("Scatt")
        .collection("cookieboard")
        .findOne({ messageId: reaction.message.id });
      var cookieboardChannel = await client.channels.fetch(
        scatt.channels.cookieboard
      );
      if (existingMessage) {
        var discordExistingMessage = await cookieboardChannel.messages.fetch(
          existingMessage.cookieboardMessageId
        );
        if (discordExistingMessage) {
          await discordExistingMessage.edit({
            content: `<@${
              reaction.message.author.id
            }> | 🍪x${reaction.count.toString()}`,
            allowedMentions: { users: [] },
          });
        }
      }
    }
  } catch (err) {
    conZsole.log(err);
  }
});

client.on("messageReactionAdd", async function (reaction, user) {
  try {
    if (reaction._emoji.name === "🍪") {
      await reaction.fetch();
      var existingMessage = await dbClient
        .db("Scatt")
        .collection("cookieboard")
        .findOne({ messageId: reaction.message.id });
      var cookieboardChannel = await client.channels.fetch(
        scatt.channels.cookieboard
      );
      if (existingMessage) {
        var discordExistingMessage = await cookieboardChannel.messages.fetch(
          existingMessage.cookieboardMessageId
        );
        if (discordExistingMessage) {
          await discordExistingMessage.edit({
            content: `<@${
              reaction.message.author.id
            }> | 🍪x${reaction.count.toString()}`,
            allowedMentions: { users: [] },
          });
        }
      } else {
        if (reaction.count >= scatt.min_reactions) {
          if (reaction.message.referenceId) {
            var reference = await reaction.message.channel.messages.fetch(
              reaction.message.referenceId
            );
            if (reference && reference.content) {
              var content = `Replying to <@${
                reference.author.id
              }>:\n> ${reference.content.replaceAll("\n", "")}\n\n${
                reaction.message.content
              }`;
            } else {
              var content = reaction.message.content;
            }
          } else {
            var content = reaction.message.content;
          }
          var embed = new EmbedBuilder()
            .setAuthor({
              name: reaction.message.author.username,
              iconURL: reaction.message.author.avatarURL(),
            })
            .setFooter({
              text: "React to messages with a 🍪 to get them here!",
            })
            .setColor(reaction.message.member.displayHexColor)
            .setTimestamp(reaction.message.createdTimestamp);
          if (reaction.message.content && reaction.message.content !== "") {
            embed.setDescription(content);
          }
          var row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle("Link")
              .setLabel("Go to Message")
              .setURL(reaction.message.url)
          );
          var msg = await cookieboardChannel.send({
            embeds: [embed],
            content: `<@${
              reaction.message.author.id
            }> | 🍪x${reaction.count.toString()}`,
            allowedMentions: { users: [] },
            components: [row],
            files: reaction.message.attachments.map((attachment) => attachment),
          });
          var timeToBoard =
            new Date().getTime() -
            new Date(reaction.message.createdTimestamp).getTime();
          var records = await dbClient
            .db("Scatt")
            .collection("records")
            .findOne({ name: "Cookieboard Speedrun" });
          if (records) {
            var channel = await client.channels.fetch(
              scatt.channels.server_changes
            );
            channel.send({
              content: `<:st_emoji_party:1008191843281936414> <@${
                reaction.message.author.id
              }>'s message just broke the record for fastest a message has gotten onto the Cookieboard! It only took ${(
                timeToBoard / 1000
              ).toString()} seconds!`,
            });
            await dbClient
              .db("Scatt")
              .collection("records")
              .updateOne(
                { name: "Cookieboard Speedrun" },
                { $set: { value: timeToBoard, holder: msg.url } },
                { upsert: true }
              );
          } else {
            await dbClient
              .db("Scatt")
              .collection("records")
              .insertOne({
                name: "Cookieboard Speedrun",
                holder: msg.url,
                value: timeToBoard,
              });
          }
          await dbClient.db("Scatt").collection("cookieboard").insertOne({
            messageId: reaction.message.id,
            cookieboardMessageId: msg.id,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

client.on("interactionCreate", async function (interaction) {
  if (interaction.customId === "startmodmail") {
    var modmailChannel = await client.channels.fetch(scatt.channels.modmail);
    var existingModmail = await modmailChannel.threads.cache.find(
      (x) => x.name === interaction.user.id
    );
    await interaction.message.edit({ components: [] });
    if (existingModmail) {
      interaction.reply({
        content: "Modmail is already open!",
        ephemeral: true,
      });
    } else {
      var msg = await modmailChannel.send({
        content: `@here: <@${interaction.user.id}> has opened a modmail.`,
      });
      var thread = await msg.startThread({
        name: interaction.user.id,
        autoArchiveDuration: 1440,
        reason: "Needed a separate thread for modmail.",
      });
      var message = await interaction.message.channel.messages.fetch(
        interaction.message.reference.messageId
      );
      if (message && message.content && message.content !== "") {
        message.react("<:successful:1043300109921829054>");
        var webhook = new WebhookClient({
          url: "https://discord.com/api/webhooks/1002257663771549736/K8uu6rN-y9ZleUHKQALT35CkW4hzW6DctGfkeOuWm1Wuz_fvTq5YQe2yXGjAMF1QopaI",
        });
        await webhook.send({
          content: message.content,
          files: message.attachments.map((attachment) => attachment),
          username: message.author.username,
          avatarURL: message.author.avatarURL(),
          embeds: [],
          threadId: thread.id,
        });
        interaction.reply({
          content: "We've opened a modmail and alerted the moderation team.",
        });
      } else {
        message.react("<:unsuccessful:1043300105450696765>");
      }
    }
  }
  if (interaction.customId === "gotit") {
    interaction.deferUpdate();
    var gotit = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("gotit")
        .setLabel(interaction.user.username + " Is Already Welcoming Them")
        .setStyle("Primary")
        .setDisabled(true)
    );

    var content = `<:successful:1043300109921829054> Thanks for welcoming <@${interaction.user.id}>!\n\nWe gave you 1,000 XP for welcoming them- please don't forget to welcome them, though! You won't receive your XP if you don't actually welcome them.\n\nMake sure you let them know this:\n1. Please welcome them\n2. Tell them to ask a server moderator if they need anything\n\nThank you so much!\n- ScratchTools Server`;

    await interaction.message.edit({
      content: interaction.message.content,
      components: [gotit],
    });
    var userdata = await dbClient
      .db("Scatt")
      .collection("userdata")
      .findOne({ id: interaction.user.id });
    if (userdata && userdata.xp) {
      await dbClient
        .db("Scatt")
        .collection("userdata")
        .updateOne(
          { id: interaction.user.id },
          { $set: { xp: userdata.xp + 1000 } },
          { upsert: true }
        );
    } else {
      var newUser = {
        id: interaction.user.id,
        xp: 1000,
      };
      await dbClient.db("Scatt").collection("userdata").insertOne(newUser);
    }
  }
  if (interaction.customId && interaction.customId.startsWith("next-")) {
    if (interaction.message.interaction.user.id === interaction.user.id) {
      var leaderboard = await getLeaderboard();
      var embed = new EmbedBuilder().setTitle("Leaderboard");
      var description = "";
      var lastCounted;
      var offset = Number(interaction.customId.split("-")[1]);
      leaderboard.forEach(function (el, i) {
        if (i < offset + 15 && i > offset - 1) {
          description =
            description +
            `**${(i + 1).toString()})** <@${el.id}> (${el.xp.toString()} XP)\n`;
          lastCounted = i + 1;
        }
      });
      embed.setDescription(description);
      lastPage = lastCounted === leaderboard.length;
      var buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setEmoji("⬅️")
          .setLabel("Previous")
          .setCustomId("last-" + (offset + 15).toString())
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setDisabled(lastPage)
          .setEmoji("➡️")
          .setLabel("Next")
          .setStyle("Secondary")
          .setCustomId("next-" + (offset + 15).toString())
      );
      interaction.message.edit({ embeds: [embed], components: [buttons] });
      interaction.deferUpdate();
    } else {
      interaction.reply({
        content:
          "Sorry, but this isn't yours! You can open your own with `/xp leaderboard`!",
        ephemeral: true,
      });
    }
  }
  if (interaction.customId && interaction.customId.startsWith("last-")) {
    if (interaction.message.interaction.user.id === interaction.user.id) {
      var leaderboard = await getLeaderboard();
      var embed = new EmbedBuilder().setTitle("Leaderboard");
      var description = "";
      var offset = Number(interaction.customId.split("-")[1]);
      leaderboard.forEach(function (el, i) {
        if (i < offset - 15 && i > offset - 31) {
          description =
            description +
            `**${(i + 1).toString()})** <@${el.id}> (${el.xp.toString()} XP)\n`;
        }
      });
      embed.setDescription(description);
      lastPage = offset === 30;
      var buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(lastPage)
          .setEmoji("⬅️")
          .setLabel("Previous")
          .setCustomId("last-" + (offset - 15).toString())
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setDisabled(false)
          .setEmoji("➡️")
          .setLabel("Next")
          .setStyle("Secondary")
          .setCustomId("next-" + (offset - 15).toString())
      );
      interaction.message.edit({ embeds: [embed], components: [buttons] });
      interaction.deferUpdate();
    } else {
      interaction.reply({
        content:
          "Sorry, but this isn't yours! You can open your own with `/xp leaderboard`!",
        ephemeral: true,
      });
    }
  }
  if (interaction.type === 2) {
    const { commandName } = interaction;
    if (commandName === "config") {
      if (
        interaction.channel.id === scatt.channels.staff_cmd ||
        interaction.channel.id === scatt.channels.bots
      ) {
        interaction.reply({ embeds: [getConfigurationEmbed(true)] });
      } else {
        interaction.reply({ embeds: [getConfigurationEmbed(false)] });
      }
    }
    if (commandName === "is-bad-word") {
      var response = await fetch(
        "https://raw.githubusercontent.com/web-mech/badwords/master/lib/lang.json"
      );
      var data = await response.json();
      var deleteMessage = false;
      var whitelist = scatt.whitelist;
      data.words.forEach(function (el) {
        if (
          interaction.options.getString("message").toLowerCase().includes(el) &&
          !whitelist.includes(el)
        ) {
          deleteMessage = true;
        }
      });
      if (deleteMessage) {
        interaction.reply({
          content:
            "<:unsuccessful:1043300105450696765> This message is not safe.",
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: "<:successful:1043300109921829054> This message is safe.",
          ephemeral: true,
        });
      }
    }
    if (commandName === "say") {
      interaction.reply({
        content: "<:successful:1043300109921829054> Done!",
        ephemeral: true,
      });
      interaction.channel.send({
        content: interaction.options.getString("content"),
      });
      var logs = await client.channels.fetch(scatt.channels.logs);
      logs.send({
        content: `<@${
          interaction.user.id
        }> used me to say: ${interaction.options.getString("content")}`,
        allowedMentions: { users: [] },
      });
    }
    if (commandName === "modmail") {
      if (interaction.options.getSubcommand() === "close") {
        if (
          interaction.channel &&
          interaction.channel.parentId === scatt.channels.modmail
        ) {
          var user = await client.users.fetch(interaction.channel.name);
          if (user) {
            interaction.channel.setName(user.tag);
            var closedEmbed = new EmbedBuilder()
              .setTitle("Modmail Closed")
              .setDescription(
                interaction.options.getString("reason") ||
                  "This modmail has been closed by the moderation team from ScratchTools. You can open another one in the future if you need anything. Thanks for talking with us."
              )
              .setColor("Blurple");
            user.send({ embeds: [closedEmbed] });
            interaction.reply({
              content: "<:successful:1043300109921829054> Closed modmail!",
            });
          } else {
            interaction.reply({
              content:
                "<:unsuccessful:1043300105450696765> The user that this modmail belongs to couldn't be found!",
              ephemeral: true,
            });
          }
        } else {
          interaction.reply({
            content:
              "<:unsuccessful:1043300105450696765> This doesn't look like a modmail thread!",
            ephemeral: true,
          });
        }
      }
      if (interaction.options.getSubcommand() === "open") {
        var user = interaction.options.getUser("member");
        var modmailChannel = await client.channels.fetch(
          scatt.channels.modmail
        );
        var existingModmail = await modmailChannel.threads.cache.find(
          (x) => x.name === user.id
        );
        if (existingModmail) {
          interaction.reply({
            content: `A modmail already exists with this user: <#${existingModmail.id}>.`,
            ephemeral: true,
          });
        } else {
          var openEmbed = new EmbedBuilder()
            .setTitle("Modmail Opened")
            .setDescription(
              "A member of the ScratchTools moderation team has decided to open a modmail with you. You can chat with me and messages will be relayed between you and our moderation team."
            )
            .setColor("Blurple");
          interaction.reply({
            content:
              "<:successful:1043300109921829054> Opened a modmail with <@" +
              user.id +
              ">.",
            ephemeral: true,
          });
          var msg = await modmailChannel.send({
            content: `<@${interaction.user.id}> opened a modmail with <@${user.id}>.`,
            allowedMentions: { users: [] },
          });
          var thread = await msg.startThread({
            name: user.id,
            autoArchiveDuration: 1440,
            reason: "Needed a separate thread for modmail.",
          });
          await user.send({ embeds: [openEmbed] });
        }
      }
    }
    if (commandName === "invite") {
      var message = `Hi there! It's Scatt, from the ScratchTools server.\n\nScratchTools is run by a team of developers who, for the most part, started out on Scratch. We're open-source and completely free, so we rely on community members to contribute in code. One of us checked out some of the stuff you've done, and we think you're a great fit for contributing to ScratchTools.\n\nYou don't have to be on the ScratchTools *Team* to contribute. You can make a one-time code contribution to ScratchTools, or you can contribute over and over again. There are no commitments.\n\nHere are the skills needed:\n- JavaScript, HTML, **or** CSS\n\nYeah, that's it. And if you ever need help with anything at all, it's super simple to just ask for help from any of our other developers, who would always LOVE to help you out.\n\nWe would really appreciate it if you were able to contribute, but we completely understand if you don't have the time, ability, or want to contribute. Thanks for reading this message though, and we hope you're able to contribute.\n\n**To get started:**\nJust DM rgantzos!\n\n- Scatt, and the rest of the developer team`;
      interaction.options.getUser("member").send({ content: message });
      interaction.reply({
        content:
          "<:successful:1043300109921829054> Invited <@" +
          interaction.options.getUser("member").id +
          "> to contribute!",
        ephemeral: true,
        allowedMentions: { users: [] },
      });
      var logs = await client.channels.fetch(scatt.channels.logs);
      logs.send({
        content:
          "<@" +
          interaction.user.id +
          "> invited <@" +
          interaction.options.getUser("member").id +
          "> to contribute!",
        allowedMentions: { users: [] },
      });
    }
    if (commandName === "roles") {
      Object.keys(scatt.ping_roles).forEach(async function (el) {
        if (
          interaction.options.getBoolean(el) === true ||
          interaction.options.getBoolean(el) === false
        ) {
          var info = await client.channels.fetch(scatt.channels.info);
          var guild = info.guild;
          var member = await guild.members.fetch(interaction.user.id);
          var roles = await guild.roles.fetch();
          var role = roles.find((role) =>
            role.id.toLowerCase().includes(scatt.ping_roles[el])
          );
          if (interaction.options.getBoolean(el)) {
            if (
              !member.roles.cache.some(
                (role) => role.id === scatt.ping_roles[el]
              )
            ) {
              await member.roles.add(role, "Chose to with /roles.");
            }
          } else {
            if (
              member.roles.cache.some(
                (role) => role.id === scatt.ping_roles[el]
              )
            ) {
              await member.roles.remove(role, "Chose to with /roles.");
            }
          }
        }
      });
      interaction.reply({
        content:
          "<:successful:1043300109921829054> Successfully changed roles!",
        ephemeral: true,
      });
    }
    if (commandName === "view-warns") {
      var user = interaction.user;
      var userWarnings = await dbClient
        .db("Scatt")
        .collection("warnings")
        .findOne({ id: user.id });
      if (
        userWarnings &&
        userWarnings.warnings &&
        userWarnings.warnings.length > 0
      ) {
        var buildEmbed = new EmbedBuilder()
          .setTitle("Warnings")
          .setDescription(`<@${user.id}>'s warnings in the server.`)
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setThumbnail(user.avatarURL());
        userWarnings.warnings.forEach(function (el, i) {
          buildEmbed.addFields({
            name: "Warning #" + (i + 1).toString(),
            value: el.reason + ` by <@${el.moderator}>`,
            inline: false,
          });
        });
        interaction.reply({ embeds: [buildEmbed], ephemeral: true });
      } else {
        var buildEmbed = new EmbedBuilder()
          .setTitle("Warnings")
          .setDescription(`<@${user.id}>'s has no warnings in the server.`)
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setThumbnail(user.avatarURL());
        interaction.reply({ embeds: [buildEmbed], ephemeral: true });
      }
    }
    if (commandName === "warnings") {
      if (interaction.options && interaction.options.getSubcommand()) {
        if (interaction.options.getSubcommand() === "add") {
          var warning = {
            reason: interaction.options.getString("reason"),
            moderator: interaction.user.id,
          };
          var user = interaction.options.getUser("member");
          var userWarnings = await dbClient
            .db("Scatt")
            .collection("warnings")
            .findOne({ id: user.id });
          if (userWarnings) {
            userWarnings.warnings.push(warning);
            await dbClient
              .db("Scatt")
              .collection("warnings")
              .updateOne(
                { id: user.id },
                { $set: { warnings: userWarnings.warnings } },
                { upsert: true }
              );
            interaction.reply({
              content: `<:successful:1043300109921829054> Successfully warned <@${user.id}>!`,
              allowedMentions: { users: [] },
            });
            var warningEmbed = new EmbedBuilder()
              .setColor("Red")
              .setTitle("You've Been Warned")
              .setDescription(
                "Reason: " + interaction.options.getString("reason")
              )
              .setFooter({
                text: `This is warning #${userWarnings.warnings.length.toString()} for you.`,
              });
            await user.send({ embeds: [warningEmbed] });
          } else {
            await dbClient
              .db("Scatt")
              .collection("warnings")
              .insertOne({ id: user.id, warnings: [warning] });
            interaction.reply({
              content: `<:successful:1043300109921829054> Successfully warned <@${user.id}>!`,
              allowedMentions: { users: [] },
            });
            var warningEmbed = new EmbedBuilder()
              .setColor("Red")
              .setTitle("You've Been Warned")
              .setDescription(
                "Reason: " + interaction.options.getString("reason")
              )
              .setFooter({ text: `This is warning #1 for you.` });
            await user.send({ embeds: [warningEmbed] });
          }
        }
        if (interaction.options.getSubcommand() === "view") {
          var user = interaction.options.getUser("member");
          var userWarnings = await dbClient
            .db("Scatt")
            .collection("warnings")
            .findOne({ id: user.id });
          if (
            userWarnings &&
            userWarnings.warnings &&
            userWarnings.warnings.length > 0
          ) {
            var buildEmbed = new EmbedBuilder()
              .setTitle("Warnings")
              .setDescription(`<@${user.id}>'s warnings in the server.`)
              .setAuthor({ name: user.username, iconURL: user.avatarURL() })
              .setThumbnail(user.avatarURL());
            userWarnings.warnings.forEach(function (el, i) {
              buildEmbed.addFields({
                name: "Warning #" + (i + 1).toString(),
                value: el.reason + ` by <@${el.moderator}>`,
                inline: false,
              });
            });
            interaction.reply({ embeds: [buildEmbed] });
          } else {
            interaction.reply({
              content: "This user has no warnings.",
              ephemeral: true,
            });
          }
        }
        if (interaction.options.getSubcommand() === "remove") {
          var user = interaction.options.getUser("member");
          var userWarnings = await dbClient
            .db("Scatt")
            .collection("warnings")
            .findOne({ id: user.id });
          var remove = interaction.options.getInteger("warning");
          if (
            userWarnings &&
            userWarnings.warnings.length > 0 &&
            userWarnings.warnings.length + 1 > remove &&
            remove > 0
          ) {
            var warning = userWarnings.warnings[remove - 1];
            var newWarnings = [];
            userWarnings.warnings.forEach(function (el, i) {
              if (i !== remove - 1) {
                newWarnings.push(el);
              }
            });
            userWarnings.warnings = newWarnings;
            await dbClient
              .db("Scatt")
              .collection("warnings")
              .updateOne(
                { id: user.id },
                { $set: { warnings: userWarnings.warnings } },
                { upsert: true }
              );
            var removedEmbed = new EmbedBuilder()
              .setTitle("Removed Warning from " + user.tag)
              .setDescription(
                `${warning.reason} by <@${warning.moderator}> from <@${user.id}>.`
              )
              .setColor("Green")
              .setAuthor({ name: user.username, iconURL: user.avatarURL() })
              .setThumbnail(user.avatarURL());
            interaction.reply({ embeds: [removedEmbed] });
            var warningEmbed = new EmbedBuilder()
              .setColor("Green")
              .setTitle("You've Been Unwarned")
              .setDescription("Reason: " + warning.reason)
              .setFooter({
                text: `You now have ${userWarnings.warnings.length.toString()} warnings.`,
              });
            await user.send({ embeds: [warningEmbed] });
          } else {
            interaction.reply({
              content: "This warning does not exist.",
              ephemeral: true,
            });
          }
        }
      }
    }
    if (commandName === "xp") {
      if (interaction.options && interaction.options.getSubcommand()) {
        if (interaction.options.getSubcommand() === "rank") {
          var userToUse =
            interaction.options.getUser("member") || interaction.user;
          var user = await dbClient
            .db("Scatt")
            .collection("userdata")
            .findOne({ id: userToUse.id });
          if (user && user.xp) {
            var leaderboard = await getLeaderboard();
            var rank;
            leaderboard.forEach(function (el, i) {
              if (el.id === userToUse.id) {
                rank = i + 1;
              }
            });
            var embed = new EmbedBuilder()
              .setTitle(`${userToUse.tag}'s Rank`)
              .addFields(
                {
                  name: "🎖️ Rank",
                  value: "#" + rank.toString() + " in the Server",
                  inline: true,
                },
                { name: "\u200B", value: "\u200B", inline: true }
              )
              .addFields({
                name: "🌟 XP",
                value: user.xp.toString(),
                inline: true,
              })
              .addFields(
                {
                  name: "🏃 Level",
                  value: Math.floor(user.xp / 1500).toString(),
                  inline: true,
                },
                { name: "\u200B", value: "\u200B", inline: true }
              )
              .setAuthor({
                name: userToUse.username,
                iconURL: userToUse.avatarURL(),
              })
              .setThumbnail(userToUse.avatarURL());

            interaction.reply({ embeds: [embed] });
          } else {
            var leaderboard = await getLeaderboard();
            var rank;
            leaderboard.forEach(function (el, i) {
              if (el.id === userToUse.id) {
                rank = i + 1;
              }
            });
            var embed = new EmbedBuilder()
              .setTitle(`${userToUse.tag}'s Rank`)
              .setDescription(
                `This user does not have a rank yet- have them participate more!`
              )
              .setAuthor({
                name: userToUse.username,
                iconURL: userToUse.avatarURL(),
              })
              .setThumbnail(userToUse.avatarURL());
            interaction.reply({ embeds: [embed] });
          }
        }
        if (interaction.options.getSubcommand() === "leaderboard") {
          var leaderboard = await getLeaderboard();
          var embed = new EmbedBuilder().setTitle("Leaderboard");
          var description = "";
          leaderboard.forEach(function (el, i) {
            if (i < 15) {
              description =
                description +
                `**${(i + 1).toString()})** <@${
                  el.id
                }> (${el.xp.toString()} XP)\n`;
            }
          });
          embed.setDescription(description);
          var buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setDisabled(true)
              .setEmoji("⬅️")
              .setLabel("Previous")
              .setCustomId("last-15")
              .setStyle("Secondary"),
            new ButtonBuilder()
              .setDisabled(false)
              .setEmoji("➡️")
              .setLabel("Next")
              .setStyle("Secondary")
              .setCustomId("next-15")
          );
          interaction.reply({ embeds: [embed], components: [buttons] });
        }
      }
    }
  }
});

client.on("guildMemberUpdate", async (before, after) => {
  if (before.nickname !== after.nickname) {
    if (after.nickname) {
      var channel = await client.channels.fetch(scatt.channels.logs);
      channel.send({
        content: `<@${after.user.id}> changed their nickname from ${before.nickname} to ${after.nickname}.`,
      });
      var members = await before.guild.members.fetch();
      var taken = false;
      members.forEach(function (el) {
        if (
          ((el.nickname &&
            el.nickname.toLowerCase() === after.nickname.toLowerCase()) ||
            after.nickname.toLowerCase() === el.user.username.toLowerCase()) &&
          el.user !== after.user
        ) {
          taken = true;
        }
      });
      if (taken) {
        try {
          if (after.user.id !== scatt.rgantzos) {
            after.setNickname(null);
            scatt.log({
              content:
                "We fixed <@" +
                after.user.id +
                ">'s nickname to comply with the rules.",
            });
          }
        } catch (err) {
          scatt.log({
            content:
              "We tried fixing <@" +
              after.user.id +
              ">'s nickname, but we couldn't.",
          });
        }
        before.user.send({
          content:
            "⚠️ Your nickname conflicted with the username/nickname of another server member, so we changed it.",
        });
      }
    }
  }
});

client.login(process.env.token);
