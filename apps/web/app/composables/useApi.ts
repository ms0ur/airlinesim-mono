import type { UseFetchOptions } from '#app'

export const useApi = <T = any>(url: string | (() => string), options: any = {}) => {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    return useFetch(url, {
        baseURL: apiBase,
        ...options,
    }) as any
}

/**
 * Direct fetch client for when useFetch is not appropriate (e.g. in event handlers)
 */
export const $api = <T = any>(url: string, options: any = {}) => {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    return $fetch<T>(url, {
        baseURL: apiBase,
        ...options,
    })
}
