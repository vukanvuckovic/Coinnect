import { sendEmail } from "@/lib/sendEmail";

export const emailResolver = {
  Mutation: {
    sendEmail: async (
      _: any,
      args: {
        to: string;
        message: string;
        type: "welcome" | "payment" | "sent";
      }
    ) => {
      try {
        const { to, message, type } = args;

        if (!to || !message || !type) {
          console.error("No receiver, type or message specified.");
        }

        const success = await sendEmail(to, message, type);

        if (!success) console.error("Message couldn't be sent.");
        return true;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
