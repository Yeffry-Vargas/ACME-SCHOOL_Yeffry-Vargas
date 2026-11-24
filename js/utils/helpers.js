export async function hash(text) {
    const data = new TextEncoder(). encode(text);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint16Array(buffer)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}