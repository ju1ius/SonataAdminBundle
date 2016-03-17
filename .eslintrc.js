module.exports = {
    "root": true,
    "extends": "eslint:recommended",
    "env": {
        "browser": true,
        "es6": true
    },
    "globals": {
        "jQuery": true
    },
    "parserOptions": {
        "ecmaVersion": 7,
        "sourceType": "module",
        "ecmaFeatures": {
            "modules": true,
            "experimentalObjectRestSpread": true
        },
    },
    "rules": {
        "strict": [2, "function"],
        "indent": [2, 4, {"SwitchCase": 1}],
        "max-len": [2, {"code": 120, "tabWidth": 4, "ignoreUrls": true}],
        "eol-last": 2,
        // no space inside parentheses
        "space-in-parens": 2,
        "space-infix-ops": [2, {"int32Hint": false}],
        "space-unary-ops": 2,
        "no-multi-spaces": 2,
        "space-before-function-paren": [2, "always"],
        "semi-spacing": 2,
        // requires space after comment start
        "spaced-comment": 2,
        "quotes": [2, "single", "avoid-escape"],
        "quote-props": [2, "as-needed"],
        "linebreak-style": [2, "unix"],
        //
        "semi": [2, "always"],
        "one-var-declaration-per-line": [2, "always"],
        "no-unused-vars": [1, {"args": "after-used"}],
        "no-else-return": 2,
        "eqeqeq": 2,
        "no-eq-null": 2,
        // no yoda conditions
        "yoda": 2,
        // require immediate function invocation to be wrapped in parentheses
        "wrap-iife": [2, "outside"],
        "func-names": [0],
        // disallow new for side-effects
        "no-new": 2,
        // Allow console.warn for deprecation notices
        "no-console": [2, {"allow": ["warn", "error"]}],
        "no-alert": 2,
        // Nice to have, but requires fixing legacy...
        //"require-jsdoc": 2,
        "valid-jsdoc": [2, {
            "requireReturnDescription": false,
            "requireParamDescription": false,
            "requireReturn": false
        }]
    }
};
