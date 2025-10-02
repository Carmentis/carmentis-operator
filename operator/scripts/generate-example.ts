import * as fs from 'fs';
import * as path from 'path';
import { ConfigSchema } from '../src/config/types/OperatorConfig';
import { LeafDoc, schemaToJson } from './utils'; // adapte le chemin

/*
function jsonToToml(doc: LeafDoc, sectionPath: string[] = []): string {
	let lines: string[] = [];

	if (doc.type === "object" && doc.properties) {

		// check if the object contains a non-object child
		const hasNonObjectChild = Object.values(doc.properties)
			.map(prop => prop.type !== 'object')
			.reduce((prev, curr) => prev || curr, false);

		if (hasNonObjectChild) {
			const sectionName = [...sectionPath].join(".");
			lines.push(`\n[${sectionName}]\n`);
		}



		for (const key in doc.properties) {
			const value = doc.properties[key];

			if (value.type === "object") {
				lines.push(jsonToToml(value, [...sectionPath, key]));
			} else {

				// feuille
				if (value.description) {
					lines.push(`\n# ${value.description}\n`);
				}

				let tomlValue: string;

				let defaultValue = '...';
				if (value.defaultValue !== undefined) {
					if (value.type === "string") {
						defaultValue = `"${value.defaultValue}"`;
					} else {
						defaultValue = `${value.defaultValue}`;
					}
				}

				if (value.required) {
					if (defaultValue) {
						lines.push(`${key} = ${defaultValue}\n`);
					} else {
						lines.push(`${key} = ... # required\n`);
					}
				} else {
					const value = defaultValue ?? '...';
					lines.push(`# ${key} = ${value} # optional\n`);
				}


				if (value.enumValues) {
					lines.push(`# Possible values: ${value.enumValues.join(", ")}\n`);
				}

				lines.push("");
			}
		}
	}

	return lines.join("");
}

 */

/**
 * Génère le fichier example.toml
 */
function generateExample() {
	/*
	const json = ConfigSchema..({})
	const toml = jsonToToml(
		json
	)

	const outPath = path.join(__dirname, "../example-config.toml");
	fs.writeFileSync(outPath, toml, "utf-8");

	 */
	console.log("✅ example.toml généré !");
}

generateExample();
