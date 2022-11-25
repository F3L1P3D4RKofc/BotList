const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");


module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["bot-info", "info"],
            usage: '[User:user]'
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Mencione um bot.`);
        if (user.id === message.client.user.id) return message.channel.send(`-_- não to afim não`);

        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (!bot) return message.channel.send(`Bot não encontrado.`);
        let servers;
        if (bot.servers[bot.servers.length - 1])
            servers = bot.servers[bot.servers.length - 1].count;
        else servers = null;
        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        let e = new MessageEmbed()
            e.setColor(0x6b83aa)
            e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png", size: 256}), bot.invite)
            e.setDescription(bot.description)
            e.addField(`Prefixo`, bot.prefix ? bot.prefix : "Sei lá", true)
            e.addField(`Servidor de suporte`, !bot.support ? "Não adicionado" : `[Aqui](${bot.support})`, true)
            e.addField(`Site`, !bot.website ? "Não adicionado" : `[Aqui](${bot.website})`, true)
            e.addField(`Github`, !bot.github ? "Não adicionado" : `[Aqui](${bot.github})`, true)
            e.addField(`Likes`, `${bot.likes || 0} Likes`, true)
            e.addField(`Contagem de servidores`, `${servers || 0} Servidores`, true)
            e.addField(`Dono`, `<@${bot.owners.primary}>`, true)
            e.addField(`Status`, bot.state, true)
        message.channel.send(e);
    }
};