module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: { 
    react: { 
      version: '18.2' 
    } 
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    // Indent with 2 spaces
    'indent': ['error', 2],
    
    // Line endings with Unix style (LF)
    'linebreak-style': ['error', 'unix'],
    
    // Use single quotes for strings
    'quotes': ['error', 'single'],
    
    // Require semicolons
    'semi': ['error', 'never'],
    
    // No console logs in production (warn for development)
    'no-console': 'warn',
    
    // Allow props spreading (disabled by default in react/recommended)
    'react/jsx-props-no-spreading': 'off',
    
    // Enforce consistent function component definition
    'react/function-component-definition': ['error', {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function'
    }],
    
    // Enforce prop-types
    'react/prop-types': 'error',
    
    // Enforce destructuring in component props
    'react/destructuring-assignment': ['error', 'always'],
    
    // No unused variables (error instead of warning)
    'no-unused-vars': 'error',
    
    // Enforce hook rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Allow JSX in .js files
    'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],
    
    // Require default props
    'react/require-default-props': 'off',
    
    // Enforce consistent return in render
    'react/jsx-no-useless-fragment': 'warn',
    
    // Accessibility rules
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    
    // Enforce consistent array callback return
    'array-callback-return': 'error',
    
    // Enforce import order
    'import/order': 'off', // Enable if you have eslint-plugin-import installed
    
    // No React import needed with new JSX transform
    'react/react-in-jsx-scope': 'off'
  },
}
