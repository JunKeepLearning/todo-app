// eslint.config.cjs
module.exports = [
  {
    files: ['*.js', '*.vue'],  // 指定需要进行 ESLint 检查的文件类型
    languageOptions: {
      ecmaVersion: 2020,         // 设置 ECMAScript 版本
      sourceType: 'module',      // 使用 ES 模块
    },
    plugins: {
      vue: require('eslint-plugin-vue'), // 使用 Vue 插件
    },
    extends: [
      'eslint:recommended',  // 基本的 ESLint 推荐规则
      'plugin:vue/vue3-recommended',  // Vue 3 推荐规则
    ],
    rules: {
      // 你可以根据需要自定义规则
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
