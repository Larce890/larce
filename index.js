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
      '1383457550824898641': '1383463098937245737', // Level 30 → Reward
      '1383458233301209210': '1383495843125919866', // Level 40 → Reward
      '1383458334002249890': '1383495942031802503',  // Level 50 → Reward
      '1383458592589349025': '1383496201260761128',   // Level 60 → Reward
      '1383458780653555722': '1383496331502293082',   // Level 75 → Reward
      '1383459117548441671': '1383496448670437396',   // Level 90 → Reward
      '1383459109478600784': '1383496649120284732'    // Level 100 → Reward
    }
  },
  '1383459776075272233': { // Group 2
    levels: {
      '1383457400824270959': '1383512910885552188', // Level 10 → Reward
      '1383457785064325242': '1383513070378291277',  // Level 20 → Reward
      '1383457550824898641': '1383513129711046666',  // Level 30 → Reward
      '1383458233301209210': '1383513219393392825',  // Level 40 → Reward
      '1383458334002249890': '1383513300196921407',  // Level 50 → Reward
      '1383458592589349025': '1383513376071618580',  // Level 60 → Reward
      '1383458780653555722': '1383513435765211178',  // Level 75 → Reward
      '1383459117548441671': '1383513596301938819',  // Level 90 → Reward
      '1383459109478600784': '1384468750488703037'    // Level 100 → Reward
    }
  },
  '1383459301380849795': { // Group 3
    levels: {
      '1383457400824270959': '1383496721929080882',  // Level 10 → Reward
      '1383457785064325242': '1383511486005248121',  // Level 20 → Reward
      '1383457550824898641': '1383511705031807239',  // Level 30 → Reward
      '1383458233301209210': '1383511760233037845',  // Level 40 → Reward
      '1383458334002249890': '1383511869993648219',  // Level 50 → Reward
      '1383458592589349025': '1383512047785869373',  // Level 60 → Reward
      '1383458780653555722': '1383512117168308375',  // Level 75 → Reward
      '1383459117548441671': '1383512179923226624',  // Level 90 → Reward
      '1383459109478600784': '1383512256662208623'   // Level 100 → Reward
    }  
  },
  '1384814455808065556':  { // Group 4'
    levels: {
      '1383457400824270959': '1384814843655360564',  // Level 10 → Reward
      '1383457785064325242': '1384815020017192981',  // Level 20 → Reward
      '1383457550824898641': '1384814659657953300',  // Level 30 → Reward
      '1383458233301209210': '1385324841124499648',  // Level 40 → Reward
      '1383458334002249890': '1384815365997203516',  // Level 50 → Reward
      '1383458592589349025': '1384815477636988929',  // Level 60 → Reward
      '1383458780653555722': '1384816184293195857',  // Level 75 → Reward
      '1383459117548441671': '1384816295958286436',  // Level 90 → Reward
      '1383459109478600784': '1384816385728970822'   // Level 100 → Reward
          }
  }
};

// --- Special Roles on Join ---
const SPECIAL_USERS = {
  '1244543741427974211': ['1383509353000075326'], // original special user
  '978763203980951562': ['1384536215826727063'], // new user 1
  '1300220880126738444': ['1384536215826727063'], // new user 2
  '1330447183358460042': ['1384894510655602699'] // new user 3
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



client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Prevent duplicate triggers
  if (recentUpdates.has(newMember.id)) return;
  recentUpdates.set(newMember.id, true);
  setTimeout(() => recentUpdates.delete(newMember.id), 3000); // 3 seconds cooldown

  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;
  const gained = newRoles.filter(r => !oldRoles.has(r.id));

  const removedGroups = [];
  const addedGroups = [];

  for (const groupId of Object.keys(GROUPS)) {
    const hadGroup = oldRoles.has(groupId);
    const hasGroup = newRoles.has(groupId);

    if (hadGroup && !hasGroup) removedGroups.push(groupId);
    if (!hadGroup && hasGroup) addedGroups.push(groupId);
  }

  // --- Remove rewards if group removed
  for (const groupId of removedGroups) {
    const { levels } = GROUPS[groupId];
    for (const rewardRole of Object.values(levels)) {
      if (newRoles.has(rewardRole)) {
        await newMember.roles.remove(rewardRole).catch(console.error);
        console.log(`🧹 Removed ${rewardRole} from ${newMember.user.tag} due to leaving group ${groupId}`);
      }
    }
  }

  // --- Add rewards if group added
  for (const groupId of addedGroups) {
    const { levels } = GROUPS[groupId];
    for (const [levelRole, rewardRole] of Object.entries(levels)) {
      if (newRoles.has(levelRole) && !newRoles.has(rewardRole)) {
        await newMember.roles.add(rewardRole).catch(console.error);
        console.log(`🎁 Added ${rewardRole} to ${newMember.user.tag} due to joining group ${groupId} with level role ${levelRole}`);
      }
    }
  }

  // --- Handle level up rewards
  for (const [groupId, groupData] of Object.entries(GROUPS)) {
    if (!newRoles.has(groupId)) continue;

    for (const [levelRole, rewardRole] of Object.entries(groupData.levels)) {
      if (gained.has(levelRole) && !newRoles.has(rewardRole)) {
        await newMember.roles.add(rewardRole).catch(console.error);
        await newMember.roles.remove(levelRole).catch(console.error);
        const ch = newMember.guild.channels.cache.get(LOG_CHANNEL);
        if (ch) ch.send(`✅ <@${newMember.id}> has been awarded the role **${newMember.guild.roles.cache.get(rewardRole)?.name || "a reward role"}**!`);
        console.log(`✅ Gave reward (${rewardRole}) to ${newMember.user.tag}`);
      }
    }
  }
});


const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(3000, () => {
  console.log('🌐 Keep-alive server running on port 3000');
});


// --- Login ---
client.login(process.env.TOKEN);
