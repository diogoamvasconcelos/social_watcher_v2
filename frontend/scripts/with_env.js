#!/usr/bin/env node

const program = require("commander");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const execSync = require("child_process").execSync;

const fetchEnvironmentConfig = () => {
  const configPath = path.join(__dirname, "../env/environments.yaml");
  return yaml.load(fs.readFileSync(configPath, "utf8"));
};

// not used (yet?)
const getSsmParam = (paramPath) => {
  return execSync(
    `aws ssm get-parameter --name ${paramPath} --with-decryption | jq -r '.Parameter.Value'`,
    { encoding: "utf8" }
  ).trim();
};

// takes variables from environments.yaml
const getConfigEnv = (env) => {
  const config = fetchEnvironmentConfig();

  if (!env || !config[env]) {
    console.log("Error: Missing or invalid '--env' argument.");
    process.exit(1);
  }

  let resultEnv = { ENV: env };

  const dataToInterpolate = {
    env,
    rootPath: path.join(__dirname, ".."),
  };

  Object.entries({
    ...config["common"],
    ...config[env],
  }).map(([k, v]) => {
    resultEnv[k] = v.toString().replace(/\${([^}]*)}/g, (_r, k) => {
      return dataToInterpolate[k] ?? `{${k}}`;
    });
  });

  return resultEnv;
};

const toTFVars = (vars) => {
  tfvars = {};
  Object.entries(vars).map(([k, v]) => {
    tfvars[`TF_VAR_${k.toLowerCase()}`] = v;
  });

  return tfvars;
};

const cli = async (options) => {
  const env = options.env;
  const command = program.args.join(" ");
  const configEnv = getConfigEnv(env);
  const tfEnv = toTFVars(configEnv);

  let commandEnv = {
    ...configEnv,
    ...tfEnv,
    ...process.env,
  };

  try {
    execSync(command, { env: commandEnv, stdio: "inherit" });
  } catch (error) {
    console.log(error.message);
    if (error.stderr) console.log(error.stderr.toString());
    if (error.stdout) console.log(error.stdout.toString());

    process.exit(error.status);
  }
};

const main = async () => {
  program
    .version("0.0.1")
    .option("-e, --env <environment>", "the environment", "local")
    .action(cli);

  await program.parseAsync(process.argv);
};

main().catch((e) => {
  console.error("Exiting CLI with unhandled error!");
  console.error(e.stack);
  process.exit(1);
});
