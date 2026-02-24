import { inngest } from "./client";
import {
  gemini,
  createAgent,
  createTool,
  createNetwork,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "../../prompt";
import { lastAssistantTextMessageContent } from "./utils";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },

  async ({ event, step }) => {

    const sandboxId = await step.run("create-sandbox", async () => {
      const sandbox = await Sandbox.create("kunjmaheshwari2021/logick-v2");

      // Install dependencies
      await sandbox.commands.run("npm install");

      // Start dev server in background
      await sandbox.commands.run("npm run dev &");

      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const messages = await db.message.findMany({
          where: { projectId: event.data.projectId },
          orderBy: { createdAt: "desc" },
        });

        return messages.map((message) => ({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        }));
      }
    );

    const state = createState(
      { summary: "", files: {} },
      { messages: previousMessages }
    );


    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),

      tools: [

        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await Sandbox.connect(sandboxId);

                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data) => {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (error) {
                return `Command failed: ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),


        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles =
                    network?.state?.data?.files || {};

                  const sandbox = await Sandbox.connect(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return "Error: " + error;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),


        createTool({
          name: "readFiles",
          description: "Read files in the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step.run("readFiles", async () => {
              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const contents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return "Error: " + error;
              }
            });
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (
            lastAssistantMessageText &&
            network &&
            lastAssistantMessageText.includes("<task_summary>")
          ) {
            network.state.data.summary = lastAssistantMessageText;
          }

          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 10,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) return;
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    await step.run("wait-for-server", async () => {
      const sandbox = await Sandbox.connect(sandboxId);

      for (let i = 0; i < 20; i++) {
        try {
          await sandbox.commands.run("curl -s http://localhost:3000");
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    });


    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "Generate a title",
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "Generate a response",
      system: RESPONSE_PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const { output: fragmentTitleOutput } =
      await fragmentTitleGenerator.run(result.state.data.summary);

    const { output: responseOutput } =
      await responseGenerator.run(result.state.data.summary);

    const generateFragmentTitle = () => {
      if (!fragmentTitleOutput?.[0] || fragmentTitleOutput[0].type !== "text")
        return "Untitled";

      return Array.isArray(fragmentTitleOutput[0].content)
        ? fragmentTitleOutput[0].content.join("")
        : fragmentTitleOutput[0].content;
    };

    const generateResponse = () => {
      if (!responseOutput?.[0] || responseOutput[0].type !== "text")
        return "Here you go";

      return Array.isArray(responseOutput[0].content)
        ? responseOutput[0].content.join("")
        : responseOutput[0].content;
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await Sandbox.connect(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });


    await step.run("save-result", async () => {
      if (isError) {
        return await db.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again",
            role: MessageRole.ASSISTANT,
            type: MessageType.ERROR,
          },
        });
      }

      return await db.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          fragments: {
            create: {
              sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Untitled",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);