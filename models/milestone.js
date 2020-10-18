module.exports = class Milestone {
    constructor(code, name, description, points) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.points = points;
    }

    get toObject() {
        return {
            "code": this.code,
            "name": this.name,
            "description": this.description,
            "points": this.points
        }
    }

    static getMilestoneFromObject(object) {
        return new Milestone(object.code, object.name, object.description, object.points);
    }
}