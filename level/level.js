var levels = [
    {'level': 1, from: 0, to: 99},
    {'level': 2, from: 100, to: 199},
    {'level': 3, from: 200, to: 299},
    {'level': 4, from: 300, to: 399},
    {'level': 5, from: 400, to: 499},
    {'level': 6, from: 500, to: 749},
    {'level': 7, from: 750, to: 999},
    {'level': 8, from: 1000, to: 1249},
    {'level': 9, from: 1250, to: 1499},
    {'level': 10, from: 1500, to: 1749},
    {'level': 11, from: 1750, to: 1999},
    {'level': 12, from: 2000, to: 2499},
    {'level': 13, from: 2500, to: 2999},
    {'level': 14, from: 3000, to: 3499},
    {'level': 15, from: 3500, to: 3999},
    {'level': 16, from: 4000, to: 4499},
    {'level': 17, from: 4500, to: 4999},
    {'level': 18, from: 5000, to: 5999},
    {'level': 19, from: 6000, to: 6999},
    {'level': 20, from: 7000, to: 7999},
    {'level': 21, from: 8000, to: 8999},
    {'level': 22, from: 9000, to: 9999},
    {'level': 23, from: 10000, to: 11499},
    {'level': 24, from: 11500, to: 12999},
    {'level': 25, from: 13000, to: 14499},
    {'level': 26, from: 14500, to: 15999},
    {'level': 27, from: 16000, to: 17499},
    {'level': 28, from: 17500, to: 18999},
    {'level': 29, from: 19000, to: 20499},
    {'level': 30, from: 20500, to: 20501},
];

function getLevelByPoints(points) {
    for(let i = 0; i < levels.length; i++) {
        if(points >= levels[i].from && points <= levels[i].to) {
            return levels[i].level;
        }
    }
    return 0;
}

function getPointsForNextLevel(points) {
    for(let i = 0; i < levels.length; i++) {
        if(points >= levels[i].from && points <= levels[i].to) {
            return levels[i].to - points;
        }
    }
    return 0;
}

module.exports = {
    levels,
    getLevelByPoints,
    getPointsForNextLevel
}