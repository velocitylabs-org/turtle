const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const keys = process.env;
const templatePath = path.resolve(__dirname, "./env.template.ts");
const outputPath = path.resolve(__dirname, "../src/generated-env.ts");

// Read the template
let template = fs.readFileSync(templatePath, "utf-8");

// Replace the placeholder
Object.entries(keys).forEach(([key, value]) => {
  console.log(key, value);
  template = template.replace(`%%${key}%%`, value ?? "");
});

// Write the result
fs.writeFileSync(outputPath, template);

console.log("✅ Env written to src/generated-env.ts");
