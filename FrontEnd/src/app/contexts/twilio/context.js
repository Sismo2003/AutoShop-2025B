import { createSafeContext } from "utils/createSafeContext";

export const [TwilioContext, useTwilioContext] = createSafeContext(
  "useTwilioContext must be used within a TwilioProvider"
);
