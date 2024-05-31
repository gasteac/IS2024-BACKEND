
export default {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  preset: "@shelf/jest-mongodb",
  // setupFilesAfterEnv: ["./tests/setupEnv.js"],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node"
};
