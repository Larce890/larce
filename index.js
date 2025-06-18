// --- Imports ---
const { Client, GatewayIntentBits } = require('discord.js');

// --- Client Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// --- Config ---
const LOG_CHANNEL = '1384614252920180837';

const GROUPS = {
  '1383460017151279144': { // Group 1
    levels: {
      '1383457400824270959': '1383462939985580124', // Level 10 → Reward
      '1383457785064325242': '1383463028250513590', // Level 20 → Reward
      '1383457550824898641': '1383463098937245737',
      '1383458233301209210': '1383495843125919866',
      '1383458334002249890': '1383495942031802503',
      '1383458592589349025': '1383496201260761128',
      '1383458780653555722': '1383496331502293082',
      '1383459117548441671': '1383496448670437396',
      '1383459109478600784': '1383496649120284732'
    }
  },
  '1383459776075272233': { // Group 2
    levels: {
      '1383457400824270959': '1383512910885552188',
      '1383457785064325242': '1383513070378291277',
      '1383457550824898641': '1383513129711046666',
      '1383458233301209210': '1383513219393392825',
      '1383458334002249890': '1383513300196921407',
      '1383458592589349025': '1383513376071618580',
      '1383458780653555722': '1383513435765211178',
      '1383459117548441671': '1383513596301938819',
      '1383459109478600784': '1384468750488703037'
    }
  },
  '1383459301380849795': { // Group 3
    levels: {
      '1384614252920180837': '1383496721929080882',
      '1383457785064325242': '1383511486005248121',
      '1383457550824898641': '1383511705031807239',
      '1383458233301209210': '1383511760233037845',
      '1383458334002249890': '1383511869993648219',
      '1383458592589349025': '1383512047785869373',
      '1383458780653555722': '1383512117168308375',
      '1383459117548441671': '1383512179923226624',
      '1383459109478600784': '1383512256662208623'
          }
       }
};

// --- Special Roles on Join ---
const SPECIAL_USERS = {
  '1244543741427974211': ['1383509353000075326'], // original special user
  '978763203980951562': ['1384536215826727063'], // new user 1
  '1300220880126738444': ['1384536215826727063'], // new user 2
  '1383509353000075326': ['1314257862322683904']  // NEW USER 3
};


client.on('guildMemberAdd', async member => {
  const roleIds = SPECIAL_USERS[member.id];
  if (!roleIds) return;

  for (const roleId of roleIds) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.add(role).catch(console.error);
      console.log(`✅ Gave special role (${role.name}) to ${member.user.tag}`);
    } else {
      console.log(`❌ Role (${roleId}) not found for ${member.user.tag}`);
    }
  }
});


// --- Handle Level Rewards ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const gained = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));

  for (const [groupId, groupData] of Object.entries(GROUPS)) {
    const hasGroup = newMember.roles.cache.has(groupId);
    if (!hasGroup) continue;

    for (const [levelRole, rewardRole] of Object.entries(groupData.levels)) {
      if (gained.has(levelRole) && !newMember.roles.cache.has(rewardRole)) {
        await newMember.roles.add(rewardRole).catch(console.error);
        console.log(`✅ Gave reward (${rewardRole}) to ${newMember.user.tag}`);
        await newMember.roles.remove(levelRole).catch(console.error);
        const ch = newMember.guild.channels.cache.get(LOG_CHANNEL);
        if (ch) ch.send(`✅ <@${newMember.id}> has been awarded the role **${newMember.guild.roles.cache.get(rewardRole)?.name || "a reward role"}**!`);

      }
    }
  }
});

// --- Handle Group Switching ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const removedGroups = [];
  const addedGroups = [];

  for (const groupId of Object.keys(GROUPS)) {
    const hadGroup = oldRoles.has(groupId);
    const hasGroup = newRoles.has(groupId);

    if (hadGroup && !hasGroup) removedGroups.push(groupId);
    if (!hadGroup && hasGroup) addedGroups.push(groupId);
  }

  for (const groupId of removedGroups) {
    const { levels } = GROUPS[groupId];
    for (const rewardRole of Object.values(levels)) {
      if (newRoles.has(rewardRole)) {
        await newMember.roles.remove(rewardRole).catch(console.error);
        console.log(`🧹 Removed ${rewardRole} from ${newMember.user.tag} due to leaving group ${groupId}`);
      }
    }
  }

  for (const groupId of addedGroups) {
    const { levels } = GROUPS[groupId];
    for (const [levelRole, rewardRole] of Object.entries(levels)) {
      if (newRoles.has(levelRole) && !newRoles.has(rewardRole)) {
        await newMember.roles.add(rewardRole).catch(console.error);
        console.log(`🎁 Added ${rewardRole} to ${newMember.user.tag} due to joining group ${groupId} with level role ${levelRole}`);
      }
    }
  }
});

// --- Login ---
client.login(process.env.TOKEN);
