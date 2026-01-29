/**
 * URLパラメータにデータを埋め込むためのユーティリティ
 */

export function encodeBaziData(data) {
    try {
        const json = JSON.stringify(data);
        return btoa(unescape(encodeURIComponent(json)));
    } catch (e) {
        return "";
    }
}

export function decodeBaziData(encoded) {
    try {
        const json = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

export function generateShareUrl(data, type = "my") {
    const encoded = encodeBaziData(data);
    const baseUrl = window.location.origin;
    return `${baseUrl}?${type}=${encoded}`;
}
