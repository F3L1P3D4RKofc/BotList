const { Event } = require('klasa');
const Bots = require("@models/bots");
const { server: {id, mod_log_id} } = require("@root/config.json");

module.exports = class extends Event {
    async run(member) {
        let bots = await Bots.find({"owners.primary": member.user.id , state: { $ne: "deletado" } }, { _id: false });
        for (let bot of bots) {
            await Bots.updateOne({ botid: bot.botid }, { $set: { state: "deletado" } });
            try {
                let bot_member = await this.client.guilds.cache.get(id).members.fetch(bot.botid)
                bot_member.kick()
                this.channels.cache.get(mod_log_id).send(`<@${bot.botid}> deletou o bot <@${member.user.id}> (${member.user.tag}) saiu do servidor.`);
            } catch(e) {}
        }
    }
};