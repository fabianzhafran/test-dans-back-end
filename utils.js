module.exports = {
    checkSubstring: function (string, substring) {
        return substring && string.indexOf(substring) === -1
    }
}