export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { bazi, elements, period } = await request.json();

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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ fortune: text }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
