#!/usr/bin/env node
// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import "./dev";
import "./init/init";
import { program } from "@commander-js/extra-typings";

program.version(process.env.npm_package_version ?? "");
program.name("DAppStore CLI");

await program.parseAsync(process.argv);
