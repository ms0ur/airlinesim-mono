export function parseTopFrame(stack?: string): { file?: string; func?: string; line?: number } {
    if (!stack) return {};
    const line = stack.split('\n')[1] ?? '';
    const m = line.match(/at\s+(.*?)\s+\((.*):(\d+):\d+\)/) || line.match(/at\s+(.*):(\d+):\d+/);
    if (!m) return {};
    if (m.length === 4) return { func: m[1], file: m[2], line: Number(m[3]) };
    if (m.length === 3) return { file: m[1], line: Number(m[2]) };
    return {};
}
