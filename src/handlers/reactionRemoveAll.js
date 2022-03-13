const { MessageAttachment } = require('discord.js');
const axios = require('axios');

module.exports = async (manager, message) => {

	const starboards = manager.starboards.filter(channelData => channelData.guildId === message.guild.id);
	if(!starboards) return;

	manager.emit('starboardReactionRemoveAll', message);

	starboards.forEach(async data => {

		const starChannel = manager.client.channels.cache.get(data.channelId);
		if (!starChannel || data.options.ignoredChannels.includes(message.channel.id)) return;

		const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
		const starMessage = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.endsWith(message.id) && m.author.id === manager.client.user.id);
		if (starMessage) {
			const foundStar = starMessage.embeds[0];
			const image = foundStar.image && foundStar.image.url || '';
			// const starEmbed = new MessageEmbed()
			const starEmbed = starMessage.embeds[0]
				.setColor(foundStar.color)
				.setDescription(foundStar.description || '')
				.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
				// .setTimestamp()
				.setFooter({ text: `${data.options.emoji} 0 | ${message.id}` });

			const starMsg = await starChannel.messages.fetch(starMessage.id);
			if (image) {
				const res = await axios.get(image, {
					responseType: 'arraybuffer',
				});
				const ext = image.split(/[#?]/)[0].split('.').pop().trim();
				const attach = new MessageAttachment(res.data, `image.${ext}`);
				starEmbed
					.setImage(`attachment://image.${ext}`);
				// eslint-disable-next-line no-empty-function
				starMsg.edit({ embeds: [starEmbed], files: [attach] }).catch(() => {});
			}
			// eslint-disable-next-line no-empty-function
			else await starMsg.edit({ embeds: [starEmbed] }).catch(() => {});

			setTimeout(() => {
				starMsg.delete();
			}, 1000);


			return starMsg;
		}

	});

};
