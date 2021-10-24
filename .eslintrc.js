module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es2020": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 11
	},
	"rules": {
		'semi': 2,
		"no-var": 2,
		"no-undef": 0,
		"indent": [2,'tab'],
		"no-dupe-args": 2,
		'no-duplicate-case': 2,
		eqeqeq: [2, 'allow-null'],
		'eol-last': ['error', 'always'],
		"no-unused-vars": [0, {"vars": "all", "args": "after-used"}]
	},
	"globals": {
		"initNECaptcha": true
	}
};
