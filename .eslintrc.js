module.exports = {
    extends: "standard",
    parser: "babel-eslint",
    plugins: [
        "standard",
        "promise"
    ],
    overrides: [
    {
      files: [ "helpers/*.js" ],
      excludedFiles: ["**/*Test.js", "**/*.ts"],
      rules: {
        "no-unexpected-multiline": "off",
        "padded-blocks": "off",
        "spaced-comment": "off",
        "no-multi-spaces": "off",
        "key-spacing": "off"
      },
    }
  ]
}