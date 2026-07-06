// Shared assertion for the "constructor-only auth/config fields must never leak
// into an outbound request body" regression tests spread across messaging,
// addressbook, and optout specs. See src/Functions/Mapper.ts and
// src/Api/*/models|dtos for the mechanism this guards against.
export function expectNoLeakedConstructorArgs(body: Record<string, unknown>): void {
    expect(body.URL).toBeUndefined();
    expect(body.AuthToken).toBeUndefined();
    expect(body.httpClient).toBeUndefined();
}