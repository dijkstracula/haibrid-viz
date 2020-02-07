// https://github.com/microsoft/TypeScript-Node-Starter/blob/670028088f43123c6afc9eaec23337dcda265110/copyStaticAssets.ts

import * as shell from "shelljs";

shell.cp("-R", "src/public/js/lib", "dist/public/js/");
shell.cp("-R", "src/public/images", "dist/public/");