module.exports = function() { 
    this.displayName = function(user) {
        if (!_.isEmpty(user.nickname)) {
            return user.nickname;
        }

        if (!_.isEmpty(user.first_name) || !_.isEmpty(user.last_name)) {
            return user.first_name + " " + user.last_name;
        }

        return user.username;
    }
}