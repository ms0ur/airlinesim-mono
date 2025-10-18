export type Locale = 'ru' | 'en';

export type AirrorIssue = {
    path?: (string | number)[];
    code?: string;
    message?: string;
    meta?: Record<string, unknown>;
};

export type AirrorContext = {
    path?: string;
    method?: string;
    requestId?: string;
    userId?: string | number;
    tags?: string[];
};

export type AirrorJSON = {
    error: true;
    code: string;
    httpStatus: number;
    title?: Partial<Record<Locale, string>>;
    message: Partial<Record<Locale, string>>;
    details?: Record<string, unknown>;
    issues?: AirrorIssue[];
    ctx?: AirrorContext;
    debug?: {
        file?: string;
        func?: string;
        line?: number;
        at: string;
        stack?: string;
    };
};
