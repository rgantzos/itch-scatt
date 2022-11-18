

const {MongoClient} = require('mongodb');

const { Routes, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, Client, ActionRowBuilder, MessageSelectMenu, ButtonBuilder, WebhookClient, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '10' }).setToken(process.env.token);
const scatt = {
  autoReacts: {
    "<@948687053896433714>": "❤️",
    "scratchtools": "<:scratchtools:988978116187799583>"
  }
}
const dbClient = new MongoClient(process.env.database);
scatt.discordJs = require("discord.js")

const client = new scatt.discordJs.Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'ROLE'],
  fetchAllMembers: true,
  presence: {
    status: 'ONLINE',
    activities: [{
      name: `ScratchTools`,
      type: 'WATCHING'
    }]
  }
});

  async function main() {
	await dbClient.connect();
    console.log("connected")
    //Object.keys(oldXp).forEach(async function(el, i) {
      //await dbClient.db('Scatt').collection('userdata').insertOne({ id: el, xp: oldXp[el] })
      //console.log(`Progress: ${i+1}/${oldXp.length}.`)
    //})
}
main()



const xp = new SlashCommandBuilder()
  .setName('xp')
    .setDescription("Do stuff with XP.")
  .addSubcommand(subcommand =>
		subcommand
			.setName('rank')
			.setDescription('Get your XP rank!')
                .addUserOption(option =>
			option
				.setName('member')
				.setDescription('The member to view the status of.')
				.setRequired(false)))
.addSubcommand(subcommand =>
		subcommand
			.setName('leaderboard')
			.setDescription('View the XP leaderboard!'))

client.on('ready', async function() {
  console.log("Logged in as "+client.user.tag+"!")
  await rest.put(
	Routes.applicationCommands(client.user.id),
	{ body: [xp] },
);
})

async function getLeaderboard(guild) {
  var topXp = []
  var topUsers = []
  var topAll = []
  var members = await dbClient.db('Scatt').collection('userdata').find({}).toArray()
  members.forEach(function(el) {
    topXp.push(el.xp)
  })
  topXp.sort( function( a , b){
    if(a > b) return 1;
    if(a < b) return -1;
    return 0;
});
  topXp.forEach(function(el) {
    var addedAlready = false
    members.forEach(function(user) {
      if (!addedAlready && user.xp === el && !user.taken) {
        alreadyAdded = true
        user.taken = true
        topUsers.push(user.id)
        topAll.push({ id: user.id, xp: user.xp })
      }
    })
  })
  return topAll.reverse()
}

client.on('messageCreate', async function(message) {
  Object.keys(scatt.autoReacts).forEach(function(el) {
    if (message.content && message.content.toLowerCase().includes(el)) {
      message.react(scatt.autoReacts[el])
    }
  })
  if (!message.author.bot) {
    var user = await dbClient.db('Scatt').collection('userdata').findOne({ id: message.author.id })
    if (user && user.xp) {
      await dbClient.db('Scatt').collection('userdata').updateOne({"id":message.author.id}, {$set:{"xp":(user.xp+28)}}, { upsert: true })
    } else {
      var newUser = {
        id: message.author.id,
        xp: 28
      }
      await dbClient.db('Scatt').collection('userdata').insertOne(newUser)
    }
  }
})

client.on('interactionCreate', async function(interaction) {
  if (interaction.customId && interaction.customId.startsWith('next-')) {
    var leaderboard = await getLeaderboard(interaction.guild)
          var embed = new EmbedBuilder()
          .setTitle('Leaderboard')
          var description = ""
    var lastCounted
    var offset = Number(interaction.customId.split('-')[1])
    console.log(offset)
          leaderboard.forEach(function(el, i) {
            if (i < offset+15 && i > offset-1) {
            description = description+`**${(i+1).toString()})** <@${el.id}> (${el.xp.toString()} XP)\n`
              lastCounted = i+1
            }
          })
          embed.setDescription(description)
      lastPage = (lastCounted === leaderboard.length)
          var buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setDisabled(false)
            .setEmoji('⬅️')
            .setLabel('Last')
            .setCustomId('last-'+(offset+15).toString())
            .setStyle('Secondary'),
            new ButtonBuilder()
            .setDisabled(lastPage)
            .setEmoji('➡️')
            .setLabel('Next')
            .setStyle('Secondary')
            .setCustomId('next-'+(offset+15).toString())
          )
          interaction.message.edit({embeds:[embed],components:[buttons]})
    interaction.deferUpdate()
  }
  if (interaction.customId && interaction.customId.startsWith('last-')) {
    var leaderboard = await getLeaderboard(interaction.guild)
          var embed = new EmbedBuilder()
          .setTitle('Leaderboard')
          var description = ""
    var offset = Number(interaction.customId.split('-')[1])
          leaderboard.forEach(function(el, i) {
            if (i < offset-15 && i > offset-31) {
            description = description+`**${(i+1).toString()})** <@${el.id}> (${el.xp.toString()} XP)\n`
            }
          })
          embed.setDescription(description)
      lastPage = (offset === 30)
          var buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setDisabled(lastPage)
            .setEmoji('⬅️')
            .setLabel('Last')
            .setCustomId('last-'+(offset-15).toString())
            .setStyle('Secondary'),
            new ButtonBuilder()
            .setDisabled(false)
            .setEmoji('➡️')
            .setLabel('Next')
            .setStyle('Secondary')
            .setCustomId('next-'+(offset-15).toString())
          )
          interaction.message.edit({embeds:[embed],components:[buttons]})
    interaction.deferUpdate()
  }
  if (interaction.type === 2) {
    const { commandName } = interaction
    if (commandName === 'xp') {
      if (interaction.options && interaction.options.getSubcommand()) {
        if (interaction.options.getSubcommand() === 'rank') {
          var userToUse = interaction.options.getUser('user') || interaction.user
      var user = await dbClient.db('Scatt').collection('userdata').findOne({ id: userToUse.id })
    if (user && user.xp) {
      var leaderboard = await getLeaderboard(interaction.guild)
      var rank
      leaderboard.forEach(function(el, i) {
        if (el.id === userToUse.id) {
          rank = i+1
        }
      })
      var embed = new EmbedBuilder()
      .setTitle(`${userToUse.tag}'s Rank`)
        .addFields({ name: '🎖️ Rank', value: '#'+rank.toString()+' in the Server', inline: true })
        .addFields({ name: '<:emoji_air:990621682999914536>', value: '<:emoji_air:990621682999914536>', inline: true })
        .addFields({ name: '🌟 XP', value: user.xp.toString(), inline: true })
        .setAuthor({ name: userToUse.username, iconURL: userToUse.avatarURL() })
      .setThumbnail(userToUse.avatarURL())
      interaction.reply({embeds:[embed]})
    } else {
      var leaderboard = await getLeaderboard(interaction.guild)
      var rank
      leaderboard.forEach(function(el, i) {
        if (el.id === userToUse.id) {
          rank = i+1
        }
      })
      var embed = new EmbedBuilder()
      .setTitle(`${userToUse.tag}'s Rank`)
      .setDescription(`This user does not have a rank yet- have them participate more!`)
        .setAuthor({ name: userToUse.username, iconURL: userToUse.avatarURL() })
      .setThumbnail(userToUse.avatarURL())
      interaction.reply({embeds:[embed]})
    }
        }
        if (interaction.options.getSubcommand() === 'leaderboard') {
          var leaderboard = await getLeaderboard(interaction.guild)
          var embed = new EmbedBuilder()
          .setTitle('Leaderboard')
          var description = ""
          leaderboard.forEach(function(el, i) {
            if (i < 15) {
            description = description+`**${(i+1).toString()})** <@${el.id}> (${el.xp.toString()} XP)\n`
            }
          })
          embed.setDescription(description)
          var buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setDisabled(true)
            .setEmoji('⬅️')
            .setLabel('Last')
            .setCustomId('last-15')
            .setStyle('Secondary'),
            new ButtonBuilder()
            .setDisabled(false)
            .setEmoji('➡️')
            .setLabel('Next')
            .setStyle('Secondary')
            .setCustomId('next-15')
          )
          interaction.reply({embeds:[embed],components:[buttons]})
        }
      }
    }
  }
})

client.login(process.env.token);