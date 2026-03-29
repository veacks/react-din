import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const sectionHeadings = [
    '## Purpose',
    '## Props / Handles',
    '## Defaults',
    '## Integration Notes',
    '## Failure Modes',
    '## Example',
    '## Test Coverage',
];

const englishHeuristic = /\b(?:il faut|creer|créer|chaque|modification|modifications|composant|composants|noeud|noeuds|nœud|nœuds|anglais|français|francaise|avec|sans|pour|mise à jour|bibliothèque)\b|[àâçéèêëîïôûùüÿœ]/i;

const collectMarkdown = (target) => {
    const absolute = path.join(root, target);
    if (!fs.existsSync(absolute)) return [];
    const stats = fs.statSync(absolute);
    if (stats.isFile()) return [absolute];

    return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
        const next = path.join(target, entry.name);
        if (entry.isDirectory()) return collectMarkdown(next);
        return entry.name.endsWith('.md') ? [path.join(root, next)] : [];
    });
};

const stripCode = (value) =>
    value
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '');

const markdownFiles = [
    ...collectMarkdown('README.md'),
    ...collectMarkdown('AGENTS.md'),
    ...collectMarkdown('docs'),
    ...collectMarkdown('project'),
    ...collectMarkdown('example/README.md'),
];

for (const file of markdownFiles) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const contents = fs.readFileSync(file, 'utf8');
    const stripped = stripCode(contents);

    if (englishHeuristic.test(stripped)) {
        errors.push(`${relative}: documentation must stay in English`);
    }

    if (relative.startsWith('docs/components/') || relative.startsWith('docs/editor-nodes/')) {
        for (const heading of sectionHeadings) {
            if (!contents.includes(heading)) {
                errors.push(`${relative}: missing required heading "${heading}"`);
            }
        }
    }
}

if (errors.length > 0) {
    console.error('Documentation validation failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`Documentation validation passed for ${markdownFiles.length} markdown files.`);
