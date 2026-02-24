"use server";

import { MessageRole, MessageType } from "@prisma/client";
import db from "@/lib/db";
import { inngest } from "@/inngest/client";
import { getCurrentUser } from "@/modules/auth/actions";
import { consumeCredits } from "@/lib/usage";

export const createMessage = async (value, projectId) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const project = await db.project.findUnique(
        {
            where: {
                id: projectId,
                userId: user.id
            }
        }
    )

    if (!project) {
        throw new Error("Project not found!");
    }

    const newMessage = await db.message.create({
        data: {
            projectId: projectId,
            content: value,
            role: MessageRole.User,
            type: MessageType.RESULT
        }
    })

    await inngest.send({ //sending the same to the background job.
        name: "code-agent/run",
        data: {
            value: value,
            projectId: projectId
        }
    })

    return newMessage
}

export const getMessage = async ({ projectId }) => {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const project = await db.project.findFirst({
        where: {
            id: projectId,
            userId: user.id,
        }
    })

    if (!project) throw new Error("Project not found or unauthorized");

    try{
        await consumeCredits();
    }catch(error){
        if(error instanceof Error){
            throw new Error({
                code: "BAD_REQUEST",
                message:"Something went wrong"
            })
        }else{
            throw new Error({
                code: "TOO_MANY_REQUEST",
                message:"Too many requests"
            })
        }
    }

    const messages = await db.message.findMany({
        where: {
            projectId
        },
        orderBy: {
            updatedAt: "asc"
        },
        include: {
            fragments: true
        }
    })
    return messages;
}