export function formatMessage(
    tpl: string | undefined,
    vars?: Record<string, unknown>
): string | undefined {
    if (!tpl) return tpl;
    if (!vars) return tpl;
    return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
