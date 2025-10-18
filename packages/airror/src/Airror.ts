import { ERR, type ErrCode } from './codes';
import type { AirrorContext, AirrorIssue, AirrorJSON, Locale } from './types';
import { formatMessage } from './format';
import { parseTopFrame } from './stack';

const DEV = process.env.NODE_ENV !== 'production';

export type AirrorInit = {
    code: ErrCode;
    httpStatus?: number; // переопределение из каталога
    title?: Partial<Record<Locale, string>>;
    messages?: Partial<Record<Locale, string>>;
    details?: Record<string, unknown>;
    issues?: AirrorIssue[];
    ctx?: AirrorContext;
    vars?: Record<string, unknown>;  // плейсхолдеры для сообщений
    cause?: unknown;
    defaultLocale?: Locale; // чем заполнить Error.message (по умолчанию 'ru')
};

export class Airror extends Error {
    // базовые поля
    code: ErrCode;
    httpStatus: number;
    title?: Partial<Record<Locale, string>>;
    private _messages: Partial<Record<Locale, string>>;
    details?: Record<string, unknown>;
    issues?: AirrorIssue[];
    ctx?: AirrorContext;
    vars?: Record<string, unknown>;

    public override name = 'Airror';
    public override message: string;
    public override cause?: unknown;

    constructor(init: AirrorInit) {
        const catalog = ERR[init.code];
        // @ts-ignore
        const messages = { ...(catalog?.message ?? {}), ...(init.messages ?? {}) };
        const defaultLocale: Locale = init.defaultLocale ?? 'ru';
        const rawMsg = messages[defaultLocale] ?? messages.ru ?? messages.en ?? init.code;
        const finalMsg = formatMessage(rawMsg, init.vars) ?? init.code;

        super(finalMsg, { cause: init.cause as any });

        if ((Error as any).captureStackTrace) (Error as any).captureStackTrace(this, Airror);

        this.code = init.code;
        this.httpStatus = init.httpStatus ?? catalog?.httpStatus ?? 500;
        this.title = { ...(catalog?.title ?? {}), ...(init.title ?? {}) };
        this._messages = messages;
        this.details = init.details;
        this.issues = init.issues;
        this.ctx = init.ctx;
        this.vars = init.vars;
        this.cause = init.cause;
        this.message = finalMsg;
    }

    /** Локализованный текст, без изменения `Error.message` */
    getMessage(locale: Locale = 'ru'): string {
        const text = this._messages[locale] ?? this._messages.ru ?? this._messages.en ?? this.code;
        return formatMessage(text, this.vars) ?? this.code;
    }

    /** Билдеры — меняют текущий инстанс, возвращают this */
    withContext(ctx: Partial<AirrorContext>): this {
        this.ctx = { ...(this.ctx ?? {}), ...ctx };
        return this;
    }

    withDetails(details: Record<string, unknown>): this {
        this.details = { ...(this.details ?? {}), ...details };
        return this;
    }

    withIssues(issues: AirrorIssue[]): this {
        this.issues = [ ...(this.issues ?? []), ...issues ];
        return this;
    }

    withVars(vars: Record<string, unknown>): this {
        this.vars = { ...(this.vars ?? {}), ...vars };
        const raw = this._messages.ru ?? this._messages.en ?? this.code;
        this.message = formatMessage(raw, this.vars) ?? this.code;
        return this;
    }

    toJSON(locale: Locale = 'ru'): AirrorJSON {
        const base: AirrorJSON = {
            error: true,
            code: this.code,
            httpStatus: this.httpStatus,
            title: this.title,
            message: {
                ru: formatMessage(this._messages.ru, this.vars),
                en: formatMessage(this._messages.en, this.vars),
            },
            details: this.details,
            issues: this.issues,
            ctx: this.ctx
        };

        if (DEV) {
            const { file, func, line } = parseTopFrame(this.stack);
            base.debug = { file, func, line, at: new Date().toISOString(), stack: this.stack };
        }
        return base;
    }

    /** Универсальная конвертация неизвестного в Airror */
    static from(err: unknown, fallback: Partial<AirrorInit> = { code: 'INTERNAL_ERROR' }) {
        if (err instanceof Airror) return err;

        // ZodError
        const maybeZod = err as any;
        if (maybeZod?.name === 'ZodError' && Array.isArray(maybeZod.issues)) {
            const issues = maybeZod.issues.map((i: any) => ({ path: i.path, code: i.code, message: i.message }));
            return new Airror({
                code: 'VALIDATION_ERROR',
                issues,
                cause: err,
                ...fallback,
                httpStatus: fallback.httpStatus ?? ERR.VALIDATION_ERROR.httpStatus
            });
        }

        // Postgres / Drizzle
        const pgCode: string | undefined = (err as any)?.code;
        if (pgCode === '23505') {
            return new Airror({ code: 'DB_DUPLICATE', cause: err, ...fallback });
        }
        if (pgCode === '23503') {
            return new Airror({ code: 'DB_FK_VIOLATION', cause: err, ...fallback });
        }
        if ((err as any)?.name === 'DrizzleQueryError') {
            return new Airror({ code: 'DB_QUERY_ERROR', cause: err, ...fallback });
        }

        // H3 createError
        if ((err as any)?.statusCode && (err as any)?.statusMessage) {
            return new Airror({
                code: fallback.code as ErrCode ?? 'INTERNAL_ERROR',
                httpStatus: (err as any).statusCode,
                title: { ru: 'HTTP ошибка', en: 'HTTP error' },
                messages: { ru: (err as any).statusMessage, en: (err as any).statusMessage },
                cause: err
            });
        }

        // Общий случай
        return new Airror({ code: 'INTERNAL_ERROR', cause: err, ...fallback });
    }
}

/** Фабрика от кода с переопределениями (удобно для коротких вызовов) */
export function airror(code: ErrCode, init: Omit<AirrorInit, 'code'> = {}) {
    return new Airror({ code, ...init });
}
