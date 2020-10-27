let structure = {
    _id: String,
    user: {
        _id: String,
        username: String
    },
    seen: Boolean,
    action: Boolean,
    additionalProperties: {
        postid: String
    },
    createdAt: Date
}