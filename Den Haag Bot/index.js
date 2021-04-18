const discord = require("discord.js");
const botConfig = require("./botconfig.json");
const fs = require("fs");
const { sep } = require("path");
const warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"));
const ms = require('ms');
const EventEmitter = require("events");

const client = new discord.Client();
client.login(botConfig.token);

client.on("ready", async () => {

    console.log(`${client.user.username} is online.`);

    client.user.setActivity(",help", { type: "LISTENING" });

});


client.on("guildMemberAdd", member => {

    var role = member.guild.roles.cache.get("801154970023624714");

    if (!role) return;

    member.roles.add(role);



})

client.on("message", async message => {

    if (message.author.bot) return;

    if (message.channel.type === "dm") return;

    var prefix = botConfig.prefix;

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    if (command === `${prefix}hallo`) {

        return message.channel.send("Hallo!!");

    }


    if (command === `${prefix}sollistatus`) {

        var solliStatus = new discord.MessageEmbed()
            .setTitle("Sollicitatie status")
            .setDescription("Status om te solliciteren bij alle diensten.")
            .setColor("#fc0303")
            .addFields(
                { name: "Politie", value: "Gesloten" },
                { name: "Brandweer", value: "Gesloten" },
                { name: "Ambulance", value: "Open" },
                { name: "Rijkswaterstaat", value: "Open" },
                { name: "Verkeerspolitie", value: "Gesloten" },
                { name: "Koninklijke Marechaussee", value: "Open" },
                { name: "Dienst Nationale Recherche", value: "Open" },
                { name: "Dienst Speciale Interventies", value: "Gesloten" },
            )
            .setFooter("Den Haag ©")
            .setTimestamp();

        return message.channel.send(solliStatus);
    }

    if (command === `${prefix}serverinfo`) {

        var serverInfo = new discord.MessageEmbed()
            .setTitle("Server informatie")
            .setDescription("Informatie over deze server.")
            .setColor("#0000ff")
            .addFields(
                { name: "Server naam", value: message.guild.name },
                { name: "Gemaakt op", value: "Dinsdag 19 januari 2021" },
                { name: "Je bent de server gejoined op", value: message.member.joinedAt },
                { name: "Totaal aantal leden", value: message.guild.memberCount },
                { name: "Bot naam", value: client.user.username },
                { name: "Gemaakt door", value: message.guild.owner },
                { name: "Mede maker(s)", value: "Turkpro_1122" },
                { name: "Game status", value: "Gesloten" },
            )
            .setFooter("Den Haag ©")
            .setTimestamp();

        return message.channel.send(serverInfo);
    }



    if (command === `${prefix}kick`) {

        var args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);

        if (!message.member.hasPermission("KICK_MEMBERS")) return message.reply("sorry jij kan dit niet");

        if (!message.guild.me.hasPermission("KICK_MEMBERS")) return message.reply("Geen perms");

        if (!args[1]) return message.reply("Geen gebruiker opgegeven.");

        if (!args[2]) return message.reply("Gelieve een redenen op te geven.");

        var kickUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));

        var reason = args.slice(2).join(" ");

        if (!kickUser) return message.reply("Kan de gebruiker niet vinden.");

        var embed = new discord.MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(kickUser.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(`** Gekickt:** ${kickUser} (${kickUser.id})
      **Gekickt door:** ${message.author}
      **Redenen: ** ${reason}`);

        var embedPrompt = new discord.MessageEmbed()
            .setColor("GREEN")
            .setAuthor("Gelieve te reageren binnen 30 sec.")
            .setDescription(`Wil je ${kickUser} kicken?`);


        message.channel.send(embedPrompt).then(async msg => {

            var emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);


            if (emoji === "✅") {

                msg.delete();

                kickUser.kick(reason).catch(err => {
                    if (err) return message.channel.send(`Er is iets foutgegaan.`);
                });

                message.reply(embed);

            } else if (emoji === "❌") {

                msg.delete();

                message.reply("Kick geanuleerd").then(m => m.delete(5000));

            }

        });
    }

    if (command === `${prefix}ticket`) {

        const categoryID = "801158965521416214"

        var userName = message.author.username;
        var userDiscriminator = message.author.disriminator;

        var ticketBestaat = false;

        message.guild.channels.cache.forEach(channel => {

            if (channel.name == userName.toLowerCase() + "-" + userDiscriminator) {
                ticketBestaat = true;

                message.reply("Je hebt al een ticket aangemaakt");

                return;
            }

        });

        if (ticketBestaat) return;

        var ticketEmbed = new discord.MessageEmbed()
            .setTitle("Hoi" + message.author.username)
            .setFooter("Uw ticket word aangemaakt");

        message.channel.send(ticketEmbed);

        message.guild.channels.create(userName.toLowerCase() + "-" + userDiscriminator, { type: `text` }).then(
            (createdChannel) => {
                createdChannel.setParent(categoryID).then(
                    (settedParent) => {

                        settedParent.updateOverwrite(message.guild.roles.cache.find(x => x.name === `@everyone`), {
                            SEND_MESSAGES: false,
                            VIEW_CHANNEL: false
                        });

                        settedParent.updateOverwrite(message.author.id, {
                            SEND_MESSAGES: true,
                            VIEW_CHANNEL: true,
                            READ_MESSAGE_HISTORY: true,
                            ADD_REACTIONS: true,
                            CREATE_INSTANT_INVITE: false,
                            ATTACH_FILES: true,
                            CONNECT: true,
                            ADD_REACTIONS: true
                        });


                    }
                ).catch(err => {
                    message.channel.send("Er is iets foutgegaan, probeer het later opnieuw.");
                });
            }
        ).catch(err => {
            message.channel.send("Er is iets foutgegaan, probeer het later opnieuw.");
        });

    }

    if (command === `${prefix}close`) {

        const categoryID = "801158965521416214"

        if (!message.member.hasPermission("MOVE_MEMBERS")) return message.reply("Je bent niet gemachtigt deze commando te beheren.");

        if (message.channel.parentID == categoryID) {
            message.channel.delete();
        } else {

            message.channel.send("Dit commando kan alleen gebruikt worden in een ticket.");
        }

        var embedCreateTicket = new discord.MessageEmbed()
            .setTitle("Ticket, " + message.channel.name)
            .setDescription("De ticket is gemarkeerd als **compleet**.")
            .setFooter("Ticket gesloten");

        //channel voor logging
        var ticketChannel = message.member.guild.channels.cache.find(channel => channel.name === "log");
        if (ticketChannel) return message.reply("Kanaal bestaat niet");
    }

    if (command === `${prefix}help`) {

        try {

            var text = "**Den Haag Commands** \n\n **Algemeen** \n ,hallo - zegt hallo terug. \n ,sollistatus - Geeft de status om te sollicteren. \n ,serverinfo - Geeft informatie over deze server. \n ,ticket - Je maakt een ticket aan \n ,bollestaff - Zie alle bolle staffleden van de server \n\n **Moderatie** \n ,kick - Geeft de persoon een kick. \n ,ban Geeft de persoon een verbanning. \n ,close - sluit een ticket, kan alleen in een ticket worden gebruikt. \n ,warn - Geeft de persoon een waarschuwing. \n ,claim - Je claimt een ticket. \n\n **Management** \n ,staffwarn - Geeft een stafflid een staffwaarschuwing.";

            message.author.send(text);

            message.reply("Alle commands kan je vinden in je DM, zorg wel dat je DM openstaat.");

        } catch (error) {
            message.reply("Er is iets misgegaan.");
        }

    }

    if (command === `${prefix}claim`) {

        var serverInfo = new discord.MessageEmbed()
            .setTitle("Ticket Geclaimed")
            .setDescription(`Deze ticket is geclaimed door ${message.author.username}. \n\n\ Goedendag, mijn naam is ${message.author.username} van het support team. Zet hieronder alvast uw vraag/opmerking neer.`)
            .setColor("0011ff")
            .setFooter("Den Haag ©")
            .setTimestamp();

        if (!message.member.hasPermission("MOVE_MEMBERS")) return message.reply("Je bent niet gemachtigt deze commando te beheren.");
        return message.channel.send(serverInfo);
    }


    if (command === `${prefix}cRegels`) {

        var cRegels = new discord.MessageEmbed()
            .setTitle("Chat regels")
            .setColor("#37de40")
            .setDescription("Dit zijn de regels voor de chats van deze server. Hier dien je je aan te houden of er zullen consequenties komen.")
            .addFields(
                { name: "Regel 1", value: "Spammen is niet toegestaan." },
                { name: "Regel 2", value: "Mensen pesten of persoonlijk uitschelden is niet toegestaan." },
                { name: "Regel 3", value: "Geen NSFW content in de openbare chats." },
                { name: "Regel 4", value: "Niet met ziektens schelden." },
                { name: "Regel 5", value: "Niet onnodig taggen." },
                { name: "Regel 6", value: "Iedereen word gelijk behandelt." },
                { name: "Regel 7", value: "Direct of indirecte reclame in onze server is verboden." },
                { name: "Regel 8", value: "Krijgt u een warn is hier altijd aanleiding voor, is dit niet zo maakt u een ticket en gaat u niet anderen mensen hiermee lastig vallen" },
                { name: "Regel 9", value: "Mensen intimideren is verboden." }
            )
            .setFooter("Den Haag ©")
            .setTimestamp()

        return message.channel.send(cRegels);



    }

    if (command === `${prefix}sRegels`) {

        var sRegels = new discord.MessageEmbed()
            .setTitle("Spraakkanaal regels")
            .setColor("#b700ff")
            .setDescription("Dit zijn de regels voor de spraakkanalen van deze server. Hier dien je je aan te houden of er zullen consequenties komen.")
            .addFields(
                { name: "Regel 1", value: "Earrape is verboden." },
                { name: "Regel 2", value: "Voice changers zijn verboden." },
                { name: "Regel 3", value: "Schelden met ziektes in call is verboden." },
                { name: "Regel 4", value: "NSFW gerelateerde geluiden/Video beelden in call zijn veboden." },
                { name: "Regel 5", value: "Het stream van anderen games mag zolang je maar geen reclame gaat maken!" },
                { name: "Regel 6", value: " Channel hoppen, constant van call wisselen om zo mede spelers te irriteren. Is verboden." },
            )
            .setFooter("Den Haag ©")
            .setTimestamp()

        return message.channel.send(sRegels);



    }

    if (command === `${prefix}tRegels`) {

        var tRegels = new discord.MessageEmbed()
            .setTitle("Ticket regels")
            .setColor("#00e8d9")
            .setDescription("Dit zijn de regels voor als je een ticket aanmaakt/open hebt staan. Hier dien je je aan te houden of er zullen consequenties komen.")
            .addFields(
                { name: "Regel 1", value: "Stel uw ticket word per ongeluk gesloten maakt u een nieuwe aan en zal het staff lid zich verontschuldigen word niet boos op onze medewerkers!" },
                { name: "Regel 2", value: "Je hebt maar 1 ticket open staan, stel je hebt een ticket en je komt een exploiter tegen mag u dat zelfde ticket daarvoor gebruiken." },
                { name: "Regel 3", value: "Spam taggen in een ticket is verboden!" },
            )
            .setFooter("Den Haag ©")
            .setTimestamp()

        return message.channel.send(tRegels);



    }

    if (command === `${prefix}ban`) {

        const args = message.content.slice(prefix.length).split(/ +/);

        if (!args[1]) return message.reply("Geen gebruiker opgegeven.");

        if (!args[2]) return message.reply("Gelieve een redenen op te geven.");

        if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply("sorry jij kan dit niet");

        if (!message.guild.me.hasPermission("BAN_MEMBERS")) return message.reply("Geen perms");

        var banUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));

        var reason = args.slice(2).join(" ");

        if (!banUser) return message.reply("Kan de gebruiker niet vinden.");

        var banEmbed = new discord.MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(banUser.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(`** Geband:** ${banUser} (${banUser.id})
            **Geband door:** ${message.author}
            **Redenen: ** ${reason}`);

        var embedPrompt = new discord.MessageEmbed()
            .setColor("GREEN")
            .setAuthor("Gelieve te reageren binnen 30 sec.")
            .setDescription(`Wil je ${banUser} bannen?`);


        message.channel.send(embedPrompt).then(async msg => {

            var emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);


            // We kijken dat het de gebruiker is die het als eerste heeft uitgevoerd.
            // message.channel.awaitMessages(m => m.author.id == message.author.id,
            //     { max: 1, time: 30000 }).then(collected => {

            //         if (collected.first().content.toLowerCase() == 'yes') {
            //             message.reply('Kick speler.');
            //         }
            //         else
            //             message.reply('Geanuleerd');

            //     }).catch(() => {
            //         message.reply('Geen antwoord na 30 sec, geanuleerd.');
            //     });


            if (emoji === "✅") {

                msg.delete();


                banUser.ban({ reason })(err => {
                    if (err) return message.channel.send(`Er is iets foutgegaan.`);
                });

                message.reply(banEmbed);

            } else if (emoji === "❌") {

                msg.delete();

                message.reply("Ban geanuleerd").then(m => m.delete(5000));

            }

        });
    }

    // Emojis aan teksten kopellen.
    async function promptMessage(message, author, time, reactions) {
        // We gaan eerst de tijd * 1000 doen zodat we seconden uitkomen.
        time *= 1000;

        // We gaan ieder meegegeven reactie onder de reactie plaatsen.
        for (const reaction of reactions) {
            await message.react(reaction);
        }

        // Als de emoji de juiste emoji is die men heeft opgegeven en als ook de auteur die dit heeft aangemaakt er op klikt
        // dan kunnen we een bericht terug sturen.
        const filter = (reaction, user) => reactions.includes(reaction.emoji.name) && user.id === author.id;

        // We kijken als de reactie juist is, dus met die filter en ook het aantal keren en binnen de tijd.
        // Dan kunnen we bericht terug sturen met dat icoontje dat is aangeduid.
        return message.awaitReactions(filter, { max: 1, time: time }).then(collected => collected.first() && collected.first().emoji.name);
    }

    if (command === `${prefix}warn`) {

        const args = message.content.slice(prefix.length).split(/ +/);

        if (!message.member.hasPermission("MOVE_MEMBERS")) return message.reply("sorry jij kan dit niet");

        if (!args[0]) return message.reply("Geen gebruiker opgegeven.");

        if (!args[1]) return message.reply("Gelieve een redenen op te geven.");

        if (!message.guild.me.hasPermission("MOVE_MEMBERS")) return message.reply("Geen perms");

        var warnUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

        var reason = args.slice(1).join(" ");

        if (!warnUser) return message.reply("Kan de gebruiker niet vinden.");

        if (warnUser.hasPermission("MANAGE_MESSAGES")) return message.reply("Jij kunt deze gebruiker niet warnen.");

        if (!warns[warnUser.id]) warns[warnUser.id] = {
            warns: 0
        };

        warns[warnUser.id].warns++;

        fs.writeFile("./warnings.json", JSON.stringify(warns), (err) => {
            if (err) console.log(err);
        });

        var warnEmbed = new discord.MessageEmbed()
            .setTitle("Waarschuwing")
            .setColor("#ff0000")
            .setThumbnail(warnUser.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(`** Gewaarschuwd:** ${warnUser} (${warnUser.id})
     **Gewaarschuwd door:** ${message.author}
     **Reden(en): ** ${reason}`)
            .addField("Aantal waarschuwingen", warns[warnUser.id].warns);

        var channel = message.member.guild.channels.cache.get("816832214393946162");

        if (!channel) return;

        channel.send(warnEmbed);

        if (warns[warnUser.id].warns == 7) {

            var pasOpEmbed = new discord.MessageEmbed()
                .setColor("#ff0000")
                .setDescription("Pas op! Je hebt nog 1 waarschuwing voor een ban")
                .setFooter(message.member.displayName, message.author.displayAvatarURL)
                .setTimestamp()
                .addField("Aantal waarschuwingen", warns[warnUser.id].warns);

            message.channel.send(pasOpEmbed);

        } else if (warns[warnUser.id].warns == 4) {
            message.guild.member(warnUser).ban(reason);
            message.channel.send(`${warnUser} is verbannen van de server wegens teveel aan waarschuwingen.`);
        }
    }


    if (command === `${prefix}politie`) {

        var politie = new discord.MessageEmbed()
            .setTitle("Politie Sollicitatie")
            .setDescription("Welkom bij de politie sollicitatie, je solliciteerd nu voor een HR rang binnen het politie team. Vul de vragen rustig in! Succes!")
            .setColor("#001aff")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het politie team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is BTGV?" },
                { name: "Vraag 7", value: "Wat is OvD-P?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Wat is RDM? " },
                { name: "Vraag 11", value: "Wat is FRP? naam?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(politie);


    }

    if (command === `${prefix}kmar`) {

        var kmar = new discord.MessageEmbed()
            .setTitle("Koninklijke Marechaussee Sollicitatie")
            .setDescription("Welkom bij de KMar sollicitatie, je solliciteerd nu voor een HR rang binnen het KMar team. Vul de vragen rustig in! Succes!")
            .setColor("#000c73")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het KMar team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is BTGV?" },
                { name: "Vraag 7", value: "Wat zijn de taken van de Koninklijke Marechaussee?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Wat is HRB? " },
                { name: "Vraag 11", value: "Wat is BSB?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(kmar);


    }

    if (command === `${prefix}brw`) {

        var kmar = new discord.MessageEmbed()
            .setTitle("Brandweer Sollicitatie")
            .setDescription("Welkom bij de brandweer sollicitatie, je solliciteerd nu voor een HR rang binnen het brandweer team. Vul de vragen rustig in! Succes!")
            .setColor("#ff0000")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het brandweer team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is TAS?" },
                { name: "Vraag 7", value: "Wat zijn de taken van de brandweer?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Wat is OvD-B? " },
                { name: "Vraag 11", value: "Wat is GRIP?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(kmar);


    }

    if (command === `${prefix}ambu`) {

        var ambu = new discord.MessageEmbed()
            .setTitle("Ambulance Sollicitatie")
            .setDescription("Welkom bij de ambulance sollicitatie, je solliciteert nu voor een HR rang binnen het ambulance team. Vul de vragen rustig in! Succes!")
            .setColor("#f6ff00")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het ambulance team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is AED?" },
                { name: "Vraag 7", value: "Wat is een fractuur?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Noem 3 voorwerpen die in een EHBO-kit zitten." },
                { name: "Vraag 11", value: "Wat is OvD-G?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(ambu);


    }

    if (command === `${prefix}rws`) {

        var rws = new discord.MessageEmbed()
            .setTitle("Rijkswaterstaat Sollicitatie")
            .setDescription("Welkom bij de rijkswaterstaat sollicitatie, je solliciteert nu voor een HR rang binnen het rijkswaterstaat team. Vul de vragen rustig in! Succes!")
            .setColor("#ff8c00")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het rijkswaterstaat team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is DRIP?" },
                { name: "Vraag 7", value: "Wat zijn MATRIX borden?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Wat is IM?" },
                { name: "Vraag 11", value: "Wat is OvD-RWS?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(rws);


    }

    if (command === `${prefix}vp`) {

        var vp = new discord.MessageEmbed()
            .setTitle("Verkeerspolitie Sollicitatie")
            .setDescription("Welkom bij de verkeerspolitie sollicitatie, je solliciteert nu voor een HR rang binnen het verkeerspolitie team. Vul de vragen rustig in! Succes!")
            .setColor("#00a6ff")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het verkeerspolitie team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat zijn spitsers?" },
                { name: "Vraag 7", value: "Wat is DKDB?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Wat is Mobiel Banditisme?" },
                { name: "Vraag 11", value: "Wat is de officiele naam van de verkeerspolitie?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(vp);


    }

    if (command === `${prefix}DSI`) {

        var DSI = new discord.MessageEmbed()
            .setTitle("Dienst Speciale Interventies Sollicitatie")
            .setDescription("Welkom bij de Dienst Speciale Interventies sollicitatie, je solliciteert nu voor de rang eenheidsleider binnen het Dienst Speciale Interventies team. Vul de vragen rustig in! Succes!")
            .setColor("#000000")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het Dienst Speciale Interventies team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is AOT?" },
                { name: "Vraag 7", value: "Wat is AE/OO?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Waar gaat de DSI op af?" },
                { name: "Vraag 11", value: "Wat doet het RRT?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(DSI);


    }

    if (command === `${prefix}DNR`) {

        var DNR = new discord.MessageEmbed()
            .setTitle("Dienst Nationale Recherche Sollicitatie")
            .setDescription("Welkom bij de Dienst Nationale Recherche sollicitatie, je solliciteert nu voor een HR rang binnen het Dienst Nationale Recherche team. Vul de vragen rustig in! Succes!")
            .setColor("#262525")
            .addFields(
                { name: "Vraag 1", value: "Wat is je naam?" },
                { name: "Vraag 2", value: "Wat is je roblox naam?" },
                { name: "Vraag 3", value: "Waarom het Dienst Nationale Recherche team?" },
                { name: "Vraag 4", value: "Wat wil je bereiken in het staffteam?" },
                { name: "Vraag 5", value: "Noem alle prio's op die je kent. Vertel een uitleg erbij." },
                { name: "Vraag 6", value: "Wat is VOA?" },
                { name: "Vraag 7", value: "Wat is de OvJ?" },
                { name: "Vraag 8", value: "Wat is AA? Afkorting + uitleg" },
                { name: "Vraag 9", value: "Wat is TA? Afkorting + uitleg" },
                { name: "Vraag 10", value: "Wat doet de DNR?" },
                { name: "Vraag 11", value: "Wat is de HOvJ?" },
                { name: "Vraag 12", value: "Wat doe je als een HR/HC+ abused?" },
                { name: "Vraag 13", value: "Verder nog vragen/opmerkingen?" }
            )
            .setFooter("Den Haag ©")
            .setTimestamp();
        message.channel.send(DNR);


    }

    if (command === `${prefix}staffwarn`) {

        const args = message.content.slice(prefix.length).split(/ +/);

        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply("sorry jij kan dit niet");

        if (!args[0]) return message.reply("Geen gebruiker opgegeven.");

        if (!args[1]) return message.reply("Gelieve een redenen op te geven.");

        if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.reply("Geen perms");

        var warnUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

        var reason = args.slice(1).join(" ");

        if (!warnUser) return message.reply("Kan de gebruiker niet vinden.");

        if (!warns[warnUser.id]) warns[warnUser.id] = {
            warns: 0
        };

        warns[warnUser.id].warns++;

        fs.writeFile("./warnings.json", JSON.stringify(warns), (err) => {
            if (err) console.log(err);
        });

        var warnEmbed = new discord.MessageEmbed()
            .setTitle("Staffwaarschuwing")
            .setColor("#ff0000")
            .setThumbnail(warnUser.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(`** Gewaarschuwd:** ${warnUser} (${warnUser.id})
     **Gewaarschuwd door:** ${message.author}
     **Reden(en): ** ${reason}`)
            .addField("Aantal staffwaarschuwingen", warns[warnUser.id].warns);

        var channel = message.member.guild.channels.cache.get("816832214393946162");

        if (!channel) return;

        channel.send(warnEmbed);
    }

    if (command === `${prefix}geslaagd`) {

        var geslaagd = new discord.MessageEmbed()
            .setTitle("Sollicitatie Uitslag")
            .setDescription(`Beste Sollicitant, \n\n Wij hebben uw sollicitatie nagekeken en wij hebben besloten u aan te nemen. \n Gefeliciteerd! Wij zijn blij dat u ons staffteam komt versterken.`)
            .setFooter("Den Haag ©")
            .setColor("#009922")
            .setTimestamp();
        message.channel.send(geslaagd);

    }

    if (command === `${prefix}gezakt`) {

        var gezakt = new discord.MessageEmbed()
            .setTitle("Sollicitatie Uitslag")
            .setDescription(`Beste Sollicitant, \n\n Wij hebben uw sollicitatie nagekeken en wij hebben besloten u niet aan te nemen. \n Volgende keer beter. \n Hiervoor kunnen redenen zijn zoals: Slordige sollicitatie, meerdere antwoorden incorrect beantwoord, te korte sollicitatie. Volgende keer beter!`)
            .setFooter("Den Haag ©")
            .setColor("#ff0000")
            .setTimestamp();
        message.channel.send(gezakt);

    }

    if (command === `${prefix}bollestaff`) {

        var bolle = new discord.MessageEmbed()
            .setTitle(`Lijst van de bolle staffleden in ${message.guild.name}`)
            .setDescription(" 1. Ziyech2 (Co-Creator) \n 2. Tyvano (Super Administrator) \n 3. Dean (Game Creator) \n 4. Matthew (Management) \n 5. Noah (Super Administrator)  \n\n **Dit waren de bolste mensen hiero!** \n\n  `1 is de bolste en 5 is het minst bol` ")
            .setColor("#ff00c8")
            .setFooter("Den Haag ©")
            .setTimestamp();
        return message.channel.send(bolle);

    }

    if (command === `${prefix}HR`) {

        var HR = new discord.MessageEmbed()
            .setTitle(`Staffleden van ${message.guild.name}.`)
            .setColor("#00fff2")
            .setDescription("Hier vind je alle staffleden van deze server. Je vind deze op rank en je ziet welke eenheid(en) deze zijn en de leidinggevendes.")
            .addFields(
                { name: "Moderators", value: "Kjelt (Politie)" },
                { name: "Administratoren", value: "Boy (Verkeerspolitie, Politie) \n Giani (Koninklijke Marechaussee) \n Taha (DSI)" },
                { name: "Super Administratoren", value: "Lois (Ambulance, DSI) \n Noah (Ambulance, verkeerspolitie, DSI) \n Thijmen (Politie, ambulance, DSI) \n Tyvano (DNR, Koninklijke Marechaussee)" },
                { name: "Management", value: "Kythe \n Matthew" },
                { name: "Co-Creators", value: "Collin \n Elian \n Ziyech2" },
                { name: "Game Creator(s)", value: "Dean (Officiele Game Creator) \n Turkpro_1122 (2e game creator)" },
                { name: "Politie Leidinggevende", value: "NVT" },
                { name: "Brandweer Leidinggevende", value: "NVT" },
                { name: "Ambulance Leidinggevende", value: "Lois" },
                { name: "Rijkswaterstaat Leidinggevende", value: "NVT" },
                { name: "Verkeerspolitie Leidinggevende", value: "Kythe" },
                { name: "Koninklijke Marechaussee Leidinggevende", value: "Ziyech2" },
                { name: "Dienst Nationale Recherche Leidinggevende", value: "Tyvano" },
                { name: "Dienst Speciale Interventie Leidinggevende", value: "Matthew" }
            )
            .setTimestamp()
            .setFooter("Den Haag ©");

        return message.channel.send(HR);

    }

    if (command === `${prefix}afmeld`) {

        var afmeld = new discord.MessageEmbed()
            .setFooter("U heeft zich succesvol afgemeld.")
            .setColor("#005555")
            .setTimestamp();

        message.channel.send(afmeld);


    }

    if (command === `${prefix}aanmeld`) {

        var aanmeld = new discord.MessageEmbed()
            .setFooter("U heeft zich succesvol aangemeld.")
            .setColor("#005555")
            .setTimestamp();

        message.channel.send(aanmeld);

    }


});
