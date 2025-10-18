import type { Locale } from './types';

type CatalogEntry = {
    httpStatus: number;
    title?: Partial<Record<Locale, string>>;
    message?: Partial<Record<Locale, string>>;
};

export const ERR = {
    // Общие
    INTERNAL_ERROR: { httpStatus: 500, title: { ru: 'Внутренняя ошибка', en: 'Internal error' },
        message: { ru: 'Что-то пошло не так', en: 'Something went wrong' } },
    NOT_IMPLEMENTED: { httpStatus: 501, title: { ru: 'Не реализовано', en: 'Not implemented' } },
    BAD_REQUEST: { httpStatus: 400, title: { ru: 'Некорректный запрос', en: 'Bad request' } },
    UNAUTHORIZED: { httpStatus: 401, title: { ru: 'Нужна авторизация', en: 'Unauthorized' },
        message: { ru: 'Войдите в систему', en: 'Please sign in' } },
    FORBIDDEN: { httpStatus: 403, title: { ru: 'Доступ запрещён', en: 'Forbidden' },
        message: { ru: 'Недостаточно прав', en: 'Insufficient permissions' } },
    NOT_FOUND: { httpStatus: 404, title: { ru: 'Не найдено', en: 'Not found' },
        message: { ru: '{entity} не найден', en: '{entity} not found' } },
    CONFLICT: { httpStatus: 409, title: { ru: 'Конфликт', en: 'Conflict' } },
    RATE_LIMIT: { httpStatus: 429, title: { ru: 'Слишком много запросов', en: 'Too many requests' } },

    // Валидация / парсинг
    VALIDATION_ERROR: { httpStatus: 400, title: { ru: 'Ошибка валидации', en: 'Validation error' },
        message: { ru: 'Проверьте корректность введённых данных', en: 'Please verify the input data' } },

    // База данных / Drizzle / Postgres
    DB_ERROR: { httpStatus: 500, title: { ru: 'Ошибка БД', en: 'Database error' } },
    DB_QUERY_ERROR: { httpStatus: 500, title: { ru: 'Ошибка запроса', en: 'Query error' } },
    DB_DUPLICATE: { httpStatus: 409, title: { ru: 'Дубликат', en: 'Duplicate' },
        message: { ru: 'Запись уже существует', en: 'Record already exists' } },
    DB_FK_VIOLATION: { httpStatus: 409, title: { ru: 'Нарушено ограничение', en: 'FK violation' },
        message: { ru: 'Нарушено внешнее ключевое ограничение', en: 'Foreign key constraint violated' } },

    // Внешние сервисы
    SERVICE_UNAVAILABLE: { httpStatus: 503, title: { ru: 'Сервис недоступен', en: 'Service unavailable' } },
} satisfies Record<string, CatalogEntry>;

export type ErrCode = keyof typeof ERR;
