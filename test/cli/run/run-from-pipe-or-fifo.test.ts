import { describe, test, expect } from "bun:test";
import { spawnSync } from "bun";
import { tmpdir } from "node:os";
import fs from "node:fs";
import { bunExe } from "harness";

if (process.platform !== "win32") {
  describe("test script being pipe or fifo stream", () => {
    test("open script from pipe", () => {
      // Create a temporary file.
      const tmpFile = `${tmpdir()}/bun-open-fd-test-script.js`;
      fs.writeFileSync(tmpFile, 'console.log("hello")\n');

      // Run the script using the file descriptor.
      //
      // TODO(SeedyROM): Probably don't use bash for this???
      // TODO(SeedyROM): Need to figure out why the symlink isn't being followed to the pipe
      //
      // NOTE(SeedyROM): NodeJS issue with a similar problem:
      // https://github.com/nodejs/node/issues/18255
      const p = spawnSync(["bash", "-c", `${bunExe()} <(cat ${tmpFile})`], {
        stderr: "inherit",
        env: {
          "BUN_DEBUG_QUIET_LOGS": "1",
        },
      });

      try {
        // Expect the script to run successfully.
        expect(p.exitCode).toBe(0);

        // Expect the output to be "hello\n".
        expect(p.stdout.toString()).toBe("hello\n");
      } finally {
        // Delete the temporary file.
        // fs.unlinkSync(tmpFile);
      }
    });
  });
}
