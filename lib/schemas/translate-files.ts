import { z } from "zod";

export const formSchema = z.object({
    filesIds: z.array(z.string()).min(1, "At least one file is required"),
    targetLanguage: z.string().min(1, "At least one target language is required"),
});