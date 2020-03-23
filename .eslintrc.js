
const branchName = require('current-git-branch')();
const ew = (branchName == 'master' ? "error" : "warn");

module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2019,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4, { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            ew,
            { "argsIgnorePattern": "^_" }
        ],
        "no-console": [
            ew,
            { "allow": ["info", "warn", "error"] }
        ],
        "no-trailing-spaces": [
            "error"
        ]
    }
};
