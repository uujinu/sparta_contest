module.exports = {
  extends: ["airbnb-base", "plugin:prettier/recommand"],
  rules: {
    "no-console": "off",
  },
  plugins: ["@html-eslint"],
  overrides: [
    {
      files: ["*.html"],
      parser: "@html-eslint/parser",
      extends: ["plugin:@html-eslint/recommand"],
    },
  ],
  parserOptions: {
    sourceType: "module",
  },
  settings: {
    "html/indent": "0",
    "html/indent": "+2",
    "html/indent": "tab",
  },
};