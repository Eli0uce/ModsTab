const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/ui",
    fullyParallel: true,
    use: { viewport: { width: 1280, height: 900 }, trace: "retain-on-failure" },
});
