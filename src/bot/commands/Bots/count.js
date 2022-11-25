const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'count',
            runIn: ['text'],
            aliases: ["list", "botcount", "bot-count"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Veja quantos bots tem na bot list."
        });
    }

    async run(message) {
        let bots = await Bots.find({}, { _id: false })
        bots = bots.filter(bot => bot.state !== "deletado");
        if (bots.length === 1) message.channel.send(`Tem \`1\` bot na bot list.`)
        else message.channel.send(`Tem \`${bots.length}\` bots na bot list.`)
    }
};
