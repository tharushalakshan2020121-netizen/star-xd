require('dotenv').config();

const settings = {
  packname: 'sᴛᴀʀ xᴅ',
  author: 'ᴍᴀʟᴠɪɴ ᴋɪɴɢ',
  botName: 'sᴛᴀʀ xᴅ', //Your bot name
  version: '1.2.0',
  botOwner: 'ᴍᴀʟᴠɪɴ ᴋɪɴɢ', //Your name
  imageUrl: 'https://i.ibb.co/rRg9wTZV/malvin-xd.jpg',    
  ownerNumber: process.env.OWNER_NUMBER || '263714757857',
  giphyApiKey: process.env.GIPHY_API_KEY || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: 'public',
  description: 'This is a bot for managing group commands and automating tasks.',
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || 'true', // Automatically view WhatsApp statuses
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || 'true', // Automatically react to WhatsApp statuses with random emoji
    
  SESSION_ID: process.env.SESSION_ID || ''// make sure it starts with starecore~
};

global.SESSION_ID = settings.SESSION_ID;

module.exports = settings;
