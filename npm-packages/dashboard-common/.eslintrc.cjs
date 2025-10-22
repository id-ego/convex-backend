module.exports = {
  root: true,
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  extends: [
    "next/core-web-vitals",
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "prettier",
    "plugin:better-tailwindcss/recommended-warn",
    "plugin:better-tailwindcss/recommended-error",
    "plugin:storybook/recommended",
  ],
  plugins: ["prettier"],
  settings: {
    "better-tailwindcss": {
      entryPoint: "../@convex-dev/design-system/src/styles/shared.css",
    },
  },
  rules: {
    eqeqeq: ["error", "always"],

    // We prefer named exports over default exports
    // because default exports with different
    // name from import site can be confusing.
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",

    // We want to allow named `function`s used as arguments to
    // HoCs, see https://react.dev/reference/react/memo#reference
    // as an example.
    "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],

    // This rule is not smart enough to allow referencing components
    // wrapped in HoCs from other components, so we disable it
    // altogether.
    "@typescript-eslint/no-use-before-define": "off",

    // Turn a bunch of Airbnb preset defaults off because
    // they are a little too strict or do not match our style.
    "no-bitwise": "off",
    "import/no-extraneous-dependencies": "off",
    "no-underscore-dangle": "off",
    "react/no-unstable-nested-components": "off",
    "jsx-a11y/no-autofocus": "off",
    "react/react-in-jsx-scope": "off",
    quotes: "off",
    "@typescript-eslint/quotes": "off",
    "arrow-parens": "off",
    "@typescript-eslint/comma-dangle": "off",
    "implicit-arrow-linebreak": "off",
    "operator-linebreak": "off",
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "no-nested-ternary": "off",
    "react/no-unescaped-entities": "off",
    "max-len": "off",
    "consistent-return": "off",
    "no-continue": "off",
    "no-plusplus": "off",
    radix: "off",
    "react/no-array-index-key": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-await-in-loop": "off",
    "@typescript-eslint/naming-convention": "off",
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        assert: "either",
        controlComponents: ["Checkbox"],
      },
    ],

    "no-restricted-imports": [
      2,
      {
        paths: ["lodash"],
        patterns: [
          {
            group: ["react-day-picker"],
            importNames: ["Button"],
            message: "You probably mean to import from @ui/Button.",
          },
        ],
      },
    ],
    // http://eslint.org/docs/rules/no-restricted-syntax
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      // "ForOfStatement",  // for-of is fine
      "LabeledStatement",
      "WithStatement",
      {
        message: "useEffectDebugger calls should not be merged in to main.",
        selector: "CallExpression[callee.name='useEffectDebugger']",
      },
      {
        message:
          "Please call `captureMessage` with an explicit severity level (e.g., 'error', 'warning', 'info').",
        selector:
          "CallExpression[callee.name='captureMessage'][arguments.length=1]",
      },
      {
        message:
          "Please call `Sentry.captureMessage` with an explicit severity level (e.g., 'error', 'warning', 'info').",
        selector:
          "CallExpression[callee.type='MemberExpression'][callee.property.name='captureMessage'][arguments.length=1]",
      },
      {
        message:
          "You probably want to use the themed error colors instead  (e.g. text-content-error). If you really want red, disable this lint rule for this line",
        selector: "Literal[value=/^.*-red-.*$/i]",
      },
      {
        message:
          "You probably want to use a header tag. If you really want this text size, disable this lint rule for this line",
        selector: "Literal[value=/^.*text-([1-4]?xl|lg).*$/i]",
      },
      {
        message:
          "You don't need to specify light and dark colors separately anymore. Use the themed colors instead (e.g. text-content-primary).",
        selector: "Literal[value=/^.*-light-.*$/i]",
      },
      {
        message:
          "You don't need to specify light and dark colors separately anymore. Use the themed colors instead (e.g. text-content-primary).",
        selector: "Literal[value=/^.*-dark-.*$/i]",
      },
      {
        message: "Don't use content text colors for backgrounds.",
        selector: "Literal[value=/^bg-content-.*$/i]",
      },
      {
        message: "Don't use background colors for text",
        selector: "Literal[value=/^text-background-.*$/i]",
      },
      {
        message:
          ".bottom-4 is blocked on convex.dev by easylist_cookie; use .bottom-four instead",
        selector: "Literal[value=/bottom-4(?:\\D|$)/i]",
      },
    ],
    // allow (_arg: number) => {}
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    "react/forbid-elements": [
      1,
      {
        forbid: [
          {
            element: "button",
            message:
              "use @ui/Button instead. If you really need a custom button, disable this rule and leave a comment explaining why.",
          },
          {
            element: "details",
            message: "use Disclosure from headlessui instead.",
          },
          {
            element: "summary",
            message: "use Disclosure from headlessui instead.",
          },
        ],
      },
    ],

    // These Airbnb presets conflict with NextJS paradigms.
    "jsx-a11y/anchor-is-valid": "off",

    // Turn off formatting rules that conflict with Prettier.
    "@typescript-eslint/indent": "off",
    "import/no-named-as-default": "off",
    "prettier/prettier": "off",
    "react/jsx-closing-tag-location": "off",
    "react/jsx-curly-newline": "off",
    "react/jsx-indent": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-wrap-multilines": "off",
    // https://stackoverflow.com/a/73967427/1526986
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    // Makes it harder to accidentally fire off a promise without waiting for it.
    "@typescript-eslint/no-floating-promises": "error",
    "no-void": "off",
    // Disable enforce-consistent-line-wrapping temporarily (will enable later + blame-ignore diff)
    "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    "better-tailwindcss/no-unregistered-classes": [
      "error",
      {
        ignore: [
          // For some reason the ESLint plugin doesn’t recognize classes defined in CSS files,
          // so let’s ignore them manually for now.
          "animate-fadeInToVar",
          "bg-stripes",
          "bottom-four",
          "DataRow",
          "disabled",
          "focused",
          "hover-decoration",
          "SelectorItem-active",
          "SelectorItem",

          // Classes not used for styling but only for referencing from JS code
          "js-.+",

          // Monaco classes
          "codicon-.+",
          "mtk.+",
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/*.stories.tsx"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
