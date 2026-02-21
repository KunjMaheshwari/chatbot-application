"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "No authenticated user found",
      };
    }

    // Proper object destructuring
    const { id, firstName, lastName, imageUrl, emailAddresses } = user;

    const emailAddress = emailAddresses?.[0]?.emailAddress || "";

    const newUser = await db.user.upsert({
      where: {
        clerkId: id,
      },
      update: {
        name:
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || null,
        image: imageUrl || null,
        email: emailAddress,
      },
      create: {
        clerkId: id,
        name:
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || null,
        image: imageUrl || null,
        email: emailAddress,
      },
    });

    return {
      success: true,
      user: newUser,
      message: "User onboarded successfully",
    };
  } catch (error) {
    console.error("Error onboarding user:", error);
    return {
      success: false,
      error: "Failed to onboard user",
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await currentUser();

    if (!user) return null;

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        clerkId: true,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};