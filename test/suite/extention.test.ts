import * as assert from 'assert';
import escapeTableName from '../../src/ls/escape-table';


suite('Extension Test Suite', () => {
    test('escape table name', () => {
        assert.strictEqual(escapeTableName('table'), 'table')
        assert.strictEqual(escapeTableName('+table'), '"+table"')
    });

    test('escape tablname with db and schema', () => {
        assert.strictEqual(escapeTableName({label: 'table', schema: 'schema', database: 'database'}), 'database.schema.table')
        assert.strictEqual(escapeTableName({label: '+table', schema: '+schema', database: '+database'}), '"+database"."+schema"."+table"')
    });
});
