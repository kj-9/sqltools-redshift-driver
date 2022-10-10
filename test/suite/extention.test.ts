import * as assert from "assert";
import * as vscode from "vscode";

import escapeTableName from "../../src/ls/escape-table";
import RedshiftDriver from "../../src/ls/driver";

suite("Parser Test Suite", () => {
  test("Escape table name only", () => {
    assert.strictEqual(escapeTableName("table"), "table");
    assert.strictEqual(escapeTableName("+table"), '"+table"');
  });

  test("Escape tablname with db and schema", () => {
    assert.strictEqual(
      escapeTableName({
        label: "table",
        schema: "schema",
        database: "database",
      }),
      "database.schema.table"
    );
    assert.strictEqual(
      escapeTableName({
        label: "+table",
        schema: "+schema",
        database: "+database",
      }),
      '"+database"."+schema"."+table"'
    );
  });
});

if (process.env.CIRCLECI) {
  console.log("Running connection tests from CircleCI...");
  suite("Connection Test Suite", () => {
    const option = {
      id: "test",
      isConnected: false,
      isActive: false,
      pgOptions: {
        ssl: true,
      },
      previewLimit: 50,
      server: process.env.REDSHIFT_ENDPOINT,
      port: parseInt(process.env.REDSHIFT_PORT),
      driver: "Redshift Driver (Dedicated ver)",
      name: "dev",
      database: process.env.REDSHIFT_DATABASE,
      username: process.env.REDSHIFT_USER,
      password: process.env.REDSHIFT_PASSSWORD,
    };
    const driver = new RedshiftDriver(option, async () => {
      const out = [];

      for (const f of vscode.workspace.workspaceFolders) {
        out.push(f);
      }

      return out;
    });

    test("Run a simple query", async () => {
      const res = await driver.query("select 1 as test", {});
      assert.deepStrictEqual(res[0].results, [{ test: 1 }]);
    });
  });
}
