const { strictEslint } = require('@umijs/fabric');

module.exports = {
  ...strictEslint,
  rules: {
    ...strictEslint.rules,
    'max-len': ['error', 150],
  },
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    ENV_CONFIG: true,
    vb: true,
  },
};
