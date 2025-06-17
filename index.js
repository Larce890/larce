const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// --- Config ---
const LOG_CHANNEL = '1384259258677198878';

// Special auto-role on join
const SPECIAL_UID = '1244543741427974211';
const SPECIAL_ROLE = '1383509353000075326';

// Group role required for leveling rewards
const GROUP_ROLE = '1383460017151279144';

// Level milestone roles → Reward roles
const LEVEL_REWARDS = {
  '1383457400824270959': '1383462939985580124', // Level 10 → Reward A
  '1383457785064325242': '1383463028250513590', // Level 20 → Reward B
  // Add more levels here like:
  // 'level_role_id': 'reward_role_id',
};

// --- Bot Ready ---
client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

// --- Assign special role to a user when they join ---
client.on('guildMemberAdd', async member => {
  if (member.id === SPECIAL_UID) {
    try {
      await member.roles.add(SPECIAL_ROLE);
      console.log(`✅ Gave special role to ${member.user.tag}`);
    } catch (err) {
      console.error(`❌ Failed to assign special role:`, err);
    }
  }
});

// --- Check for level-up roles and assign reward roles ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const newRoles = newMember.roles.cache;
  const oldRoles = oldMember.roles.cache;

  // Get roles that were newly added
  const gainedRoles = newRoles.filter(role => !oldRoles.has(role.id));

  for (const [levelRole, rewardRole] of Object.entries(LEVEL_REWARDS)) {
    if (gainedRoles.has(levelRole)) {
      const hasGroup = newRoles.has(GROUP_ROLE);
      const alreadyHasReward = newRoles.has(rewardRole);

      if (hasGroup && !alreadyHasReward) {
        try {
          await newMember.roles.add(rewardRole);
          await newMember.roles.remove(levelRole); // Optional cleanup

          console.log(`✅ Gave reward (${rewardRole}) to ${newMember.user.tag}`);

          const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL);
          if (logChannel) {
            logChannel.send(`🎉 <@${newMember.id}> reached a level and received their reward!`);
          }
        } catch (err) {
          console.error(`❌ Failed to assign reward role:`, err);
        }
      }
    }
  }
});

// --- Login ---
client.login(process.env.TOKEN);
