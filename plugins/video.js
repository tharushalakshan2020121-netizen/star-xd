

const yts = require('yt-search');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = async function videoCommand(sock, chatId, message) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const input = text.split(' ').slice(1).join(' ').trim();

    if (!input) {
        return sock.sendMessage(chatId, { text: '🎬 Please enter a video name or paste a YouTube URL.\nExample: *.video Despacito* or *.video https://youtu.be/xyz*' });
    }

    let video = null;

    // Check if input is a YouTube link
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
    if (ytRegex.test(input)) {
        const { videos } = await yts({ videoId: extractVideoId(input) });
        video = videos?.[0];
    } else {
        const { videos } = await yts(input);
        video = videos.find(v => v.seconds < 600); // Prefer videos under 10 mins
    }

    if (!video) {
        return sock.sendMessage(chatId, { text: '❌ No suitable video found.' });
    }

    const timestamp = Date.now();
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempMp4 = path.join(tempDir, `${timestamp}.mp4`);
    const fileName = video.title.replace(/[<>:"/\\|?*]/g, '').slice(0, 64) + '.mp4';

    await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: `*${video.title}*\n⏱️ Duration: ${formatDuration(video.duration.seconds)}\n👁️ Views: ${formatNumber(video.views)}\n\n_Processing video..._`
    }, { quoted: message });

    const apis = [
        `https://api.siputzx.my.id/api/dl/youtube/mp4?url=${video.url}`,
        `https://api.vreden.my.id/api/dl/ytmp4?url=${video.url}`,
        `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${video.url}`,
        `https://api.axeel.my.id/api/download/ytmp4?apikey=axeel&url=${video.url}`
    ];

    for (const url of apis) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const dlUrl = data?.data || data?.result?.download?.url || data?.result?.downloadUrl;
            if (!dlUrl) continue;

            const fileRes = await fetch(dlUrl);
            const buffer = await fileRes.buffer();
            fs.writeFileSync(tempMp4, buffer);

            await sock.sendMessage(chatId, {
                video: { url: tempMp4 },
                mimetype: 'video/mp4',
                caption: `🎥 *${video.title}*`,
                fileName
            }, { quoted: message });

            cleanup(tempMp4);
            return;
        } catch (err) {
            console.warn('Fallback failed:', err.message);
        }
    }

    await sock.sendMessage(chatId, { text: '❌ All download methods failed. Try another video.' }, { quoted: message });
};

// Extract video ID from URL
function extractVideoId(url) {
    const reg = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(reg);
    return match?.[1];
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}

function cleanup(...files) {
    setTimeout(() => {
        for (const file of files) if (fs.existsSync(file)) fs.unlinkSync(file);
    }, 5000);
}
