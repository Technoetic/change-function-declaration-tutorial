export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "color-named": "never",
    "no-descending-specificity": null,
    "media-feature-range-notation": null,
    "declaration-property-value-disallowed-list": {
      "font-family": ["/Arial/", "/Inter/", "/Roboto/"],
    },
    "selector-class-pattern": null,
  },
};
