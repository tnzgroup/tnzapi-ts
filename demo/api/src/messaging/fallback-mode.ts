export type FallbackModeResult = { ok: true; value: string[] | undefined } | { ok: false; error: string };

// The SDK's FallbackMode field now accepts an array directly (it joins multiple values into
// TNZ's real comma-separated wire format itself — see tnzapi-ts's JoinFallbackMode helper), so
// this only needs to validate each selected value against the channel's allowed table and map
// it through to the SDK's wire token (e.g. demo-side "WhatsApp" -> SDK-side "WAPP") — no joining
// happens here.
export function resolveFallbackMode(values: string[] | undefined, allowed: Record<string, string>): FallbackModeResult {
    if (!values || values.length === 0) {
        return { ok: true, value: undefined };
    }
    const mapped: string[] = [];
    for (const selected of values) {
        if (!(selected in allowed)) {
            return { ok: false, error: `Unsupported FallbackMode '${selected}' for this channel.` };
        }
        mapped.push(allowed[selected]);
    }
    return { ok: true, value: mapped };
}
