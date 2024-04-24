import { add } from "../../lib/firestore";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const docRef = await add("attractions", body);

    return { result: docRef };
  } catch (error) {
    return { error: error };
  }
});
