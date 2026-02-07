import meow from "meow";
import z from "zod";

const configSchema = z.object({
  applicationId: z.string(),
  serverURL: z.url(),
  apiKey: z.string(),
});

const envVarsSchema = z.object({
  DOKPLOY_SERVER_URL: z.string(),
  DOKPLOY_API_KEY: z.string(),
});

export async function triggerDeploy() {
  const envs = envVarsSchema.parse(process.env);

  const cliTriggerDeploy = meow(``, {
    importMeta: import.meta,
    flags: {
      appId: {
        type: "string",
        isRequired: true,
      },
    },
  });

  const config = configSchema.parse({
    applicationId: cliTriggerDeploy.flags.appId,
    serverURL: new URL(`/api/application.deploy`, envs.DOKPLOY_SERVER_URL).href,
    apiKey: envs.DOKPLOY_API_KEY,
  });

  const response = await fetch(config.serverURL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationId: config.applicationId,
    }),
  });

  if (response.ok !== true) {
    console.error("Failed to trigger deployment", {
      applicationId: config.applicationId,
      json: await response.json(),
      status: response.status,
      statusText: response.statusText,
    });

    throw new Error(`Failed to trigger deployment`);
  }

  console.log("Deployment triggered successfully");
}
