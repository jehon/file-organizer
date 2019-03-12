module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
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
			"error",
			{ "argsIgnorePattern": "^_" }
		],
		"no-console": [
			"error", 
			{ "allow": [ "info", "warn", "error" ] }
		],
		"no-trailing-spaces": [
			"error"
		]
    }
};
