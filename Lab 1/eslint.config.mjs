import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node, // 👈 this adds Node.js globals like `process`
    },
    plugins: {
      js,
    },
    rules: {
      // you can add custom rules here later if needed
    },
  },
  js.configs.recommended,
]);
