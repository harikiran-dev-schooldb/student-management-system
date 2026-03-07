import { createDefaultPreset } from "ts-jest";

const tsJest = createDefaultPreset();

/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {
    ...tsJest.transform,
  },
};