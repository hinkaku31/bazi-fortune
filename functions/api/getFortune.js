export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { bazi, elements, period } = body;

        if (!bazi || !elements || !period) {
            return new Response(JSON.stringify({
                error: "鑑定義務項目が不足しています。",
                details: "Missing required fields: bazi, elements, or period"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({
                error: "APIキーが設定されていません。",
                details: "GEMINI_API_KEY is missing in environment variables"
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const prompt = `
あなたはプロの四柱推命鑑定師です。以下の命式（四柱）と五行バランスを持つ方の「${period}の運勢」を、
深く、かつ前向きになれるような格調高い和風の言葉遣いで鑑定してください。

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
1. 総評（その時期のエネルギーの流れを雅やかに表現）
2. 具体的な傾向（仕事・財運・対人関係などを詳しく）
3. 開運の指針（ラッキーアクションや心構え）

Markdown形式（見出し、箇条書きなど）で、読んで心が洗われるような文章で出力してください。
`;

        // Updated API Endpoint: v1beta and gemini-1.5-flash-latest
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({
                error: "天の啓示（AI API）でエラーが発生しました。",
                status: response.status,
                message: errorData.error?.message || "Unknown error",
                details: errorData
            }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return new Response(JSON.stringify({
                error: "鑑定結果が空でした。",
                details: data
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            fortune: text
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "鑑定中に予期せぬ不具合が発生しました。",
            message: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

