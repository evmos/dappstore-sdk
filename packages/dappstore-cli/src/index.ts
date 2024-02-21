#!/usr/bin/env node
import "./dev";
import "./init/init";
import { program } from "@commander-js/extra-typings";

program.version(process.env.npm_package_version ?? "");
program.name("DAppStore CLI");

await program.parseAsync(process.argv);
