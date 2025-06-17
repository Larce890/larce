const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// --- Config ---
const LOG_CHANNEL = '1384259258677198878';
const GROUP = '1383460017151279144';

// Reward levels
const LEVEL_REWARDS = {
  '1383457400824270959': '1383462939985580124', // Level 10 -> Reward
  '1383457785064325242': '1383463028250513590', // Level 20 -> Reward
  '1383457785064325242': '1383463028250513590', // Level 20
  '1383457550824898641': '1383463098937245737', // Level 30
  '1383458233301209210': '1383495843125919866', // Level 40
  '1383458334002249890': '1383495942031802503', // Level 50
  '1383458592589349025': '1383496201260761128', // Level 60
  '1383458780653555722': '1383496331502293082', // Level 75
  '1383459117548441671': '1383496448670437396', // Level 90
  '1383459109478600784': '1383496649120284732'  // Level 100
  // Add more levels like this:
  // 'levelRoleID': 'rewardRoleID'
};

// Special join role
const SPECIAL_UID = '1244543741427974211';
const SPECIAL_ROLE = '1383509353000075326';

client.on('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

// --- Give Role to Specific Member on Join ---
client.on('guildMemberAdd', async member => {
  if (member.id === SPECIAL_UID) {
    const role = member.guild.roles.cache.get(SPECIAL_ROLE);
    if (!role) return console.log('❌ Special role not found');
    try {
      await member.roles.add(role);
      console.log(`✅ Gave special role to ${member.user.tag}`);
    } catch (err) {
      console.error(`❌ Failed to assign special role:`, err);
    }
  }
});

// --- Handle Level Rewards ---
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const gained = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
  for (const [levelRole, rewardRole] of Object.entries(LEVEL_REWARDS)) {
    if (gained.has(levelRole)) {
      const hasGroup = newMember.roles.cache.has(GROUP);
      const hasReward = newMember.roles.cache.has(rewardRole);
      if (hasGroup && !hasReward) {
        newMember.roles.add(rewardRole)
          .then(() => {
            console.log(`✅ Gave reward (${rewardRole}) to ${newMember.user.tag}`);
            newMember.roles.remove(levelRole); // optional cleanup
            const ch = newMember.guild.channels.cache.get(LOG_CHANNEL);
            if (ch) ch.send(`✅ <@${newMember.id}> has been awarded a reward for reaching level role <@&${levelRole}>!`);
          })
          .catch(console.error);
      }
    }
  }
});

client.login(process.env.TOKEN);
