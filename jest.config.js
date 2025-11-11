export default {
    testEnvironment: "node",
    transform: {
        "^.+\\.js$": "babel-jest",
    },
    coverageThreshold: {
        "global": {
            "branches": 98,
            "functions": 98,
            "lines": 98,
            "statements": 98
        }
    },
    collectCoverage: true,
    coverageDirectory: "./coverage"
};