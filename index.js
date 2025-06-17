const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// --- Config ---
const LEVEL10 = '1383457400824270959';
const GROUP   = '1383460017151279144';
const REWARD  = '1383462939985580124';
const LOG_CHANNEL = '1384259258677198878';

const SPECIAL_UID = '1244543741427974211';
const SPECIAL_ROLE = '1383509353000075326';

// --- Bot Ready ---
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

// --- Auto Give Reward When Level Role is Added ---
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const gained = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
  if (gained.has(LEVEL10)) {
    const hasGroup  = newMember.roles.cache.has(GROUP);
    const hasReward = newMember.roles.cache.has(REWARD);
    if (hasGroup && !hasReward) {
      newMember.roles.add(REWARD)
        .then(() => {
          console.log(`✅ Gave reward to ${newMember.user.tag}`);
          newMember.roles.remove(LEVEL10); // cleanup
          const ch = newMember.guild.channels.cache.get(LOG_CHANNEL);
          if (ch) ch.send(`✅ <@${newMember.id}> has been awarded the level 10 reward!`);
        })
        .catch(console.error);
    }
  }
});

// --- Login (Use secret instead of hardcoding in production) ---
client.login(process.env.TOKEN);

