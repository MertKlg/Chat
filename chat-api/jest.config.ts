module.exports = {
    preset : "ts-jest",
    testEnvironment : "node",
    testMatch : [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    testPathIgnorePatterns : [
        "/node_modules/",
        "/dist/"
    ],
    setupFilesAfterEnv : [
        "<rootDir>/test/jest.setup.ts"
    ]

}