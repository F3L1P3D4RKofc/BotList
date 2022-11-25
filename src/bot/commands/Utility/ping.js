const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ["pong", "latency"],
            description: "veja a velocidade do bot",
        });
    }

    async run(message, [...params]) {
        let now = Date.now()
        let m = await message.channel.send(`Pingando aki calma ae...`);
        m.edit(`Pong! \`${Date.now() - now}\`ms`)
    }

};