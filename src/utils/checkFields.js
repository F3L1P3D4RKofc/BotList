const recaptcha2 = require('recaptcha2')
const is = require('is-html');

const { server: { id }, bot_options: {
    max_owners_count,
    max_bot_tags,
    bot_tags,
    max_summary_length,
    min_description_length,
    max_description_length
}, web: { recaptcha_v2: { site_key, secret_key } } } = require("@root/config.json");

const recaptcha = new recaptcha2({
    siteKey: site_key,
    secretKey: secret_key
})

function isValidUrl(string) {
    try { new URL(string); } 
    catch (_) { return false; }
    return true;
}

module.exports = async (req, b = null) => {
    let data = req.body;

    if (!data.recaptcha_token)
        return { success: false, message: "ReCaptcha Inválido" }

    try {
        await recaptcha.validate(data.recaptcha_token)
    } catch (e) {
        return { success: false, message: "ReCaptcha Inválido" }
    }

    if (!data.long.length || !data.description.length || !data.prefix.length)
        return { success: false, message: "Preencha todos os espaços." }
    
    if (data.description.length > max_summary_length) return { success: false, message: "Seu resumo é muito longo." };
    if (String(data.note).length > max_summary_length) return { success: false, message: "Suas notas sobre o bot é muito longo." };

    if (is(data.description))
        return { success: false, message: "HTML não é suportado no resumo do bot" }
    if (is(data.note))
        return { success: false, message: "HTML não é suportado nas notas do seu bot" }

    let stripped = data.long.replace("/<[^>]*>/g")
    if (stripped.length < min_description_length)
        return { success: false, message: "Sua descrição em HTML é muito curta" }
    if (stripped.length > max_description_length)
        return { success: false, message: "Sua descrição em HTML é muito longa" }
    
    if (data.invite && !isValidUrl(data.invite)) 
        return { success: false, message: "Link de convite inválido" }
    if (data.support && !isValidUrl(data.support)) 
        return { success: false, message: "Servidor de suporte inválido" }
    if (data.website && !isValidUrl(data.website))
        return { success: false, message: "Site Inválido" }
    if (data.github && !isValidUrl(data.github))
        return { success: false, message: "Inválido Github repositorio" }
    if (data.webhook && !isValidUrl(data.webhook))
        return { success: false, message: "Inválido webhook URL" }

    if (data.tags) {
        if (!Array.isArray(data.tags))
            return { success: false, message: "Inválido bot tags" }
        if (data.tags.length > max_bot_tags)
            return { success: false, message: `Selecione até ${max_bot_tags} tags` }
        if (!data.tags.every(val => bot_tags.includes(val)))
            return { success: false, message: `Tag(s) inválida(s)` }
    }
    
    try {
        await req.app.get('client').guilds.cache.get(id).members.fetch(req.user.id);
    } catch (e) {
        return { success: false, message: "Você não está no servidor", button: { text: "Entre", url: "/join" } }

    }

    let bot;
    try {
        bot = await req.app.get('client').users.fetch(req.params.id)
        if (!bot.bot)
            return { success: false, message: "ID inválido. Coloque o id de um bot" }
    } catch (e) {

        if (e.message.endsWith("is not snowflake.") || e.message == "Unknown User")
            return { success: false, message: "Inválido bot ID" }
        else
            return { success: false, message: "Usuário não encontrado" }
    }

    if (
        b &&
        b.owners.primary !== req.user.id &&
        !b.owners.additional.includes(req.user.id) &&
        !req.user.staff
    )
        return { success: false, message: "Por favor faça login denovo.", button: { text: "Logout", url: "/logout" } }

    if (
        b &&
        data.owners.replace(',', '').split(' ').remove('').join() !== b.owners.additional.join() &&
        b.owners.primary !== req.user.id
    )
        return { success: false, message: "Apenas quem adicionou o bot pode editar os donos do bot!" };
  
    let users = []
    if (data.owners) 
        users = data.owners.replace(',', '').split(' ').remove('').filter(id => /[0-9]{16,20}/g.test(id))

    try {

        users = await req.app.get('client').guilds.cache.get(id).members.fetch({ user: users });
        users = [...new Set(users.map(x => { return x.user }).filter(user => !user.bot).map(u => u.id))];


        if (users.length > max_owners_count)
            return { success: false, message: `Você só pode adicionar até ${max_owners_count} donos do bot` };

        return { success: true, bot, users }
    } catch (e) {
        return { success: false, message: "IDs inválidos" };
    }
}
