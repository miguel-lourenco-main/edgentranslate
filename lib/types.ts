import { z } from "zod";
import { formSchema } from "./schemas/translate-files";
import { Tables } from "./database.types";

/** Domain types derived from Supabase tables and form schemas. */
export type FormData = z.infer<typeof formSchema>;
export type Subscription = Tables<'subscriptions'>;
export type LineItem = Tables<'subscription_items'>;
export type Run = Tables<'run'>
export type FileT = Tables<'file'>
export type FileMinimal = Pick<FileT, 'id' | 'filename'>
export type SubscriptionWithLineItems = Subscription & {
  items: LineItem[];
};

export type Language = {
  /** Full language name (e.g., "English (United States)") */
  longValue: string;
  /** Language code (e.g., "en") */
  value: string;
  /** Display label for the language */
  label: string;
}

/** Types used by the utils module */

export interface CurrencyFormatParams {
  /** The ISO currency code (e.g., 'USD', 'EUR') */
  currencyCode: string;
  /** The locale identifier (e.g., 'en-US') */
  locale: string;
  /** The numeric value to format */
  value: string | number;
}

export interface FileExtensionInfo {
  /** File extension without dot */
  extension: string;
  /** MIME type for the file extension */
  mimeType: string;
}

export interface InsertOrUpdateOptions<T> {
  /** React state setter function */
  setter: React.Dispatch<React.SetStateAction<T[]>>;
  /** The item to insert or update */
  newItem: T;
}

export interface DeleteOptions<T> {
  /** React state setter function */
  setter: React.Dispatch<React.SetStateAction<T[]>>;
  /** ID of the item to delete */
  deletedItemId: string;
}

export type PlainFileObject = {
  /** Name of the file */
  name: string;
  /** MIME type or file extension */
  type: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
  /** File contents as string, ArrayBuffer, or null if not loaded */
  content: string | ArrayBuffer | null;
}