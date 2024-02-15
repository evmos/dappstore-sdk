#!/usr/bin/env node
import "./dev";

import { program } from "@commander-js/extra-typings";
program.parseAsync(process.argv);
