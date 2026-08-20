module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": ["@swc/jest", { jsc: { parser: { syntax: "typescript", tsx: true } } }],
  },
  testEnvironment: "node",
  testMatch: ["**/src/**/*.spec.ts"],
}
