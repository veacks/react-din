import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const schemaPath = path.join(root, 'schemas/patch.schema.json');
const packageJsonPath = path.join(root, 'package.json');

const errors = [];

if (!fs.existsSync(schemaPath)) {
    errors.push('schemas/patch.schema.json is missing');
}

let schema = null;
if (errors.length === 0) {
    try {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    } catch (error) {
        errors.push(`schemas/patch.schema.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
}

let packageJson = null;
try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
    errors.push(`package.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (schema) {
    if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
        errors.push('schemas/patch.schema.json must declare draft 2020-12');
    }

    const requiredTopLevelKeys = ['version', 'name', 'nodes', 'connections', 'interface'];
    for (const key of requiredTopLevelKeys) {
        if (!Array.isArray(schema.required) || !schema.required.includes(key)) {
            errors.push(`schemas/patch.schema.json must require top-level key "${key}"`);
        }
    }

    if (schema.properties?.version?.const !== 1) {
        errors.push('schemas/patch.schema.json must lock PatchDocument.version to 1');
    }

    const nodeTypeEnum = schema.$defs?.nodeType?.enum;
    if (!Array.isArray(nodeTypeEnum) || nodeTypeEnum.length === 0) {
        errors.push('schemas/patch.schema.json must define a non-empty $defs.nodeType.enum');
    }

    const interfaceSchema = schema.$defs?.patchInterface;
    const interfaceKeys = ['inputs', 'events', 'midiInputs', 'midiOutputs'];
    for (const key of interfaceKeys) {
        if (!Array.isArray(interfaceSchema?.required) || !interfaceSchema.required.includes(key)) {
            errors.push(`schemas/patch.schema.json must require interface key "${key}"`);
        }
    }
}

if (packageJson) {
    if (packageJson.exports?.['./patch/schema.json'] !== './schemas/patch.schema.json') {
        errors.push('package.json must export "./patch/schema.json" -> "./schemas/patch.schema.json"');
    }

    if (!Array.isArray(packageJson.files) || !packageJson.files.includes('schemas')) {
        errors.push('package.json files must include "schemas" so the published package ships the patch schema');
    }
}

if (errors.length > 0) {
    console.error('Patch schema validation failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log('Patch schema validation passed.');
