import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([{
    extends: [...next],
    rules: {
        // New React Compiler checks that arrived with eslint-config-next 16. They flag patterns that
        // already work fine on the site, so they are reported as warnings instead of failing lint.
        "react-hooks/set-state-in-effect": "warn",
        "react-hooks/refs": "warn",
        "react-hooks/immutability": "warn",
        "react-hooks/purity": "warn",
    },
}]);
