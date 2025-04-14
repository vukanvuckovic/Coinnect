"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const verifyUser = async (currentUserId: string) => {
  if (!currentUserId) throw new Error("No userId provided for verification.");

  const cookie = (await cookies()).get("session");
  if (!cookie) throw new Error("No session");

  let decoded: jwt.JwtPayload | string;
  try {
    decoded = jwt.verify(cookie.value, process.env.JWT_SECRET!);
  } catch {
    throw new Error("Invalid session token");
  }

  const userId = (decoded as jwt.JwtPayload).id;
  if (!userId) throw new Error("No userId in token");

  if (userId.toString() !== currentUserId.toString()) {
    throw new Error("Action not verified");
  }

  return true;
};
