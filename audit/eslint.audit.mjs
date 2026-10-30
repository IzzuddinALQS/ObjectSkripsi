// Konfigurasi audit kompleksitas: CC (rule complexity) dan CogC (sonarjs)
// Ambang 0 agar SEMUA fungsi dilaporkan beserta nilainya.
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  { ignores: ["node_modules/**", ".next/**", "dist/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { sonarjs },
    rules: {
      complexity: ["warn", { max: 0 }],
      "sonarjs/cognitive-complexity": ["warn", 0],
    },
  },
];
