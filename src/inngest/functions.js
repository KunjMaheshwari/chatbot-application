import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import Sandbox from "e2b";


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "agent/hello" },

  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async()=>{
      const sandbox = await Sandbox.create("g3bpy1pqmflzkmm166bi");
      return sandbox.sandboxId;
    })


    const helloAgent = createAgent({
      name: "hello-agent",
      description: "A simple agent that says hello",
      system: "You are a helpful agent, that greets with enthusiasm",
      model:gemini({
        model: "gemini-2.5-flash"
      })
    })

    const {output} = await helloAgent.run("Say hello to user");

    const sandboxUrl = await step.run("get-sandbox-url", async()=>{
      const sandbox = await Sandbox.connect(sandboxId);
      const host = sandbox.getHost(3000);

      return `http://${host}`
    })
    return {
      message: output[0].content
    }
  },

);