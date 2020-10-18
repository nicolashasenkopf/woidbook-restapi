'use strict'

const Milestone = require('../models/milestone');
var list = [
    // Privatnachrichten
    new Milestone("ME50NIOC", "50 Nachrichten in einem Chat", "Ihr habt 50 Nachrichten im Chat verschickt", 200),
    new Milestone("ME100NIOC", "100 Nachrichten in einem Chat", "Ihr habt 100 Nachrichten im Chat verschickt", 400),
    new Milestone("ME1000NIOC", "1000 Nachrichten in einem Chat", "Ihr habt 1000 Nachrichten im Chat verschickt", 750),
    new Milestone("ME10MIOC", "10 Medien in einem Chat", "Ihr habt 10 Medien im Chat verschickt", 100),
    new Milestone("ME50MIOC", "50 Medien in einem Chat", "Ihr habt 50 Medien im Chat verschickt", 250),
    new Milestone("ME10C", "10 Chats", "Du hast 10 Chats mit verschiedenen Personen", 100),
    new Milestone("ME25C", "25 Chats", "Du hast 25 Chats mit verschiedenen Personen", 250),
    new Milestone("ME50C", "50 Chats", "Du hast 50 Chats mit verschiedenen Personen", 500),
    // Beiträge
    new Milestone("PO1PO", "1 Beitrag", "Du hast einen Beitrag gepostet", 100),
    new Milestone("PO5PO", "5 Beiträge", "Du hast 5 Beiträge gepostet", 250),
    new Milestone("PO10PO", "10 Beiträge", "Du hast 10 Beiträge gepostet", 500),
    new Milestone("PO100PO", "100 Beiträge", "Du hast 100 Beiträge gepostet", 1500),
    new Milestone("PO10LAOP", "10 Likes auf einen Beitrag", "Du hast 10 Likes auf einen Beitrag erhalten. Weiter so!", 100),
    new Milestone("PO100LAOP", "100 Likes auf einen Beitrag", "Du hast 100 Likes auf einen Beitrag erhalten. Weiter so!", 500),
    new Milestone("PO1000LAOP", "1000 Likes auf einen Beitrag", "Du hast 1000 Likes auf einen Beitrag erhalten. Weiter so!", 2000),
    new Milestone("PO1CAOP", "1 Kommentar auf einen Beitrag", "Du hast einen Kommentar auf einen Beitrag von dir erhalten erhalten. Weiter so!", 100),
    new Milestone("PO5CAOP", "5 Kommentare auf einen Beitrag", "Du hast 5 Kommentare auf einen Beitrag von dir erhalten erhalten. Weiter so!", 250),
    new Milestone("PO10CAOP", "10 Kommentare auf einen Beitrag", "Du hast 10 Kommentare auf einen Beitrag von dir erhalten erhalten. Weiter so!", 500),
    new Milestone("PO100CAOP", "100 Kommentare auf einen Beitrag", "Du hast 100 Kommentare auf einen Beitrag von dir erhalten erhalten. Weiter so!", 1500),
    // Stories
    new Milestone("ST1S", "1 Story", "Du hast deine erste Story gepostet. Bleib dran!", 100),
    new Milestone("ST5IOT", "5 Stories an einem Tag", "Du hast 5 Stories an einem Tag gepostet. Bleib dran!", 250),
    new Milestone("ST10IOT", "10 Stories an einem Tag", "Du hast 10 Stories an einem Tag gepostet. Bleib dran!", 500),
    new Milestone("ST10IOS", "10 Views auf eine Story", "Du hast auf einer Story 10 Views. Bleib dran!", 100),
    new Milestone("ST100IOS", "100 Views auf eine Story", "Du hast auf einer Story 100 Views. Bleib dran!", 1000),
    // Profil
    new Milestone("AC1F", "1 Follower", "Du hast deinen ersten Follower. Mach weiter so!", 100),
    new Milestone("AC10F", "10 Follower", "Du hast deine ersten 10 Follower. Mach weiter so!", 250),
    new Milestone("AC100F", "100 Follower", "Du hast 100 Follower erreicht. Mach weiter so!", 500),
    new Milestone("AC1000F", "1000 Follower", "Du hast 1000 Follower erreicht. Mach weiter so!", 1000),
    new Milestone("AC1IF", "1 Person am folgen", "Du folgst deiner ersten Person. Finde mehr!", 100),
    new Milestone("AC10IF", "10 Personen am folgen", "Du folgst bereits 10 Personen. Finde mehr!", 250),
    new Milestone("AC100IF", "100 Personen am folgen", "Du folgst bereits 100 Personen. Finde mehr!", 500),
    new Milestone("AC1000IF", "1000 Personen am folgen", "Du folgst bereits 1000 Personen. Finde mehr!", 1000),
];

function getMilestoneByCode(code) {
    for(let i = 0; i < list.length; i++) {
        if(list[i].code == code) {
            return list[i];
        }
    }
    return null;
}

function getMilestoneByName(name) {
    for(let i = 0; i < list.length; i++) {
        if(list[i].name == name) {
            return list[i];
        }
    }
    return null;
}

module.exports = {
    list,
    getMilestoneByCode,
    getMilestoneByName
};
