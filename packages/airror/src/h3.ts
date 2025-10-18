import type { H3Event } from 'h3';
import { setResponseStatus, getRequestHeader } from 'h3';
import type { Locale } from './types';
import { Airror } from './Airror';

export function getLocale(event: H3Event): Locale {
    const lang = (getRequestHeader(event, 'accept-language') || '').toLowerCase();
    return lang.startsWith('en') ? 'en' : 'ru';
}

export function sendAirror(event: H3Event, err: unknown) {
    const air = Airror.from(err).withContext({
        path: event.path,
        method: event.method,
        requestId: (event.context as any)?.requestId
    });
    const locale = getLocale(event);
    setResponseStatus(event, air.httpStatus);
    return air.toJSON(locale);
}

/** Обёртка для роутов */
export const withAirror =
    <T>(handler: (e: H3Event) => Promise<T> | T) =>
        async (event: H3Event) => {
            try {
                return await handler(event);
            } catch (e) {
                return sendAirror(event, e);
            }
        };
