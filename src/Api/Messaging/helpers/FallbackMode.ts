// Only SMS/WhatsApp/RCS declare FallbackMode — most channel models don't have this field at
// all. This interface plus the type guard below let BaseMessagingApi.SendMessage() check for
// and narrow to it without an `as unknown as` cast (which CLAUDE.md's typing rules discourage:
// it would silently paper over `this.entity.FallbackMode` briefly holding a string[] where its
// declared type is string).
export interface IFallbackModeCapable {
    FallbackMode?: string | string[];
}

export const hasFallbackMode = (entity: unknown): entity is IFallbackModeCapable =>
    typeof entity === 'object' && entity !== null && 'FallbackMode' in entity;

// Joins a multi-value FallbackMode selection into TNZ's real wire format — a comma-space-
// separated string (e.g. "Voice, WAPP") — confirmed against the live API via tnzapi-dotnet's
// EnumListHelper and already documented in spec/tnz-rest-api-v3.00.yaml's own WhatsApp
// FallbackMode example ('SMS, Voice'). A single string is returned untouched: this is purely
// additive over the SDK's existing single-value support, never a breaking change for it.
export const JoinFallbackMode = (value: string | string[] | undefined): string | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (Array.isArray(value)) {
        // An empty array means "nothing selected", same as undefined — [].join(', ') would
        // otherwise return '' and put "FallbackMode": "" on the wire instead of omitting the
        // field entirely.
        return value.length > 0 ? value.join(', ') : undefined;
    }
    return value;
};