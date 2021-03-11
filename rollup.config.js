import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import css from "rollup-plugin-import-css";

export default [
  {
    input: "src/plugin.js",
    output: {
      file: "dist/drawer.js",
      format: "iife",
      name: "RevealDrawer",
      plugins: [terser()],
    },
    plugins: [
      css({ output: "drawer.css", minify: true }),
      json(),
      resolve(),
      babel({ babelHelpers: "bundled" }),
    ],
  },
  {
    input: "src/plugin.js",
    output: {
      file: "dist/drawer.esm.js",
      format: "es",
      plugins: [terser()],
    },
    plugins: [
      css({ output: "drawer.css", minify: true }),
      json(),
      resolve(),
      babel({ babelHelpers: "bundled" }),
    ],
  },
];
