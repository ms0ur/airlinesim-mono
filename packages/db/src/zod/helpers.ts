import { z } from "zod";

// Хелперы
export const UUID = z.uuid();
export const IATA2 = z.string().length(2).regex(/^[A-Z0-9]{2}$/);
export const IATA3 = z.string().length(3).regex(/^[A-Z]{3}$/);
export const ICAO3 = z.string().length(3).regex(/^[A-Z]{3}$/);
export const ICAO4 = z.string().length(4).regex(/^[A-Z]{4}$/);