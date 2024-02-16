#!/usr/bin/env node
import "./dev";
import "./init/init";
import { program } from "@commander-js/extra-typings";

program.parseAsync(process.argv);
