export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // デバッグ情報の初期化
        const debug = {
            hasBazi: false,
            hasElements: false,
            hasPeriod: false,
            hasApiKey: !!env.GEMINI_API_KEY,
            apiStage: 'init'
        };

        const body = await request.json();
        const { bazi, elements, period } = body;

        debug.hasBazi = !!bazi;
        debug.hasElements = !!elements;
        debug.hasPeriod = !!period;
        debug.apiStage = 'body_parsed';

        if (!bazi || !elements || !period) {
            return new Response(JSON.stringify({
                error: "Missing required fields",
                debug: debug
            }), {
                status: 100, // Partial success in parsing but missing data
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({
                error: "GEMINI_API_KEY is not configured",
                debug: debug
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Gemini API Request
        const prompt = `
あなたはプロの四柱推命鑑定師です。以下の命式（四柱）と五行バランスを持つ方の「${period}の運勢」を、
深く、かつ前向きになれるような格調高い和風の言葉遣いで解説してください。

【命式】
年柱: ${bazi.nenchuu}
月柱: ${bazi.gecchuu}
日柱: ${bazi.nicchuu}
時柱: ${bazi.jichuu}

【五行バランス】
${JSON.stringify(elements)}

【時間軸】
${period}

【構成案】
1. 総評（その時期のエネルギーの流れ）
2. 具体的な傾向（仕事・恋愛・対人関係など）
3. ラッキーアクションと一言助言

Markdown形式で出力してください。
`;

        debug.apiStage = 'sending_to_gemini';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        debug.geminiStatus = response.status;
        debug.apiStage = 'received_from_gemini';

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({
                error: "Gemini API returned an error",
                details: errorText,
                debug: debug
            }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return new Response(JSON.stringify({
                error: "Gemini API returned an unexpected format",
                details: data,
                debug: debug
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            fortune: text,
            debug: debug
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            message: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
