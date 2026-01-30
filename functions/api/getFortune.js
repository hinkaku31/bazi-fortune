export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { bazi, elements, period } = body;

        if (!bazi || !elements || !period) {
            return new Response(JSON.stringify({
                error: "鑑定義務項目が不足しています。"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env.GROQ_API_KEY) {
            return new Response(JSON.stringify({
                error: "APIキー (GROQ_API_KEY) が設定されていません。"
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const prompt = `あなたはプロの四柱推命鑑定師です。以下の命式（四柱）と五行バランスを持つ方の「${period}の運勢」を、深く、かつ前向きになれるような格調高い和風の言葉遣いで鑑定してください。

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

Markdown形式（見出し、箇条書きなど）で、読んで心が洗われるような文章で出力してください。`;

        const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({
                error: "Groq APIエラーが発生しました。",
                message: data.error?.message || "Unknown error"
            }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            return new Response(JSON.stringify({
                error: "鑑定結果を取得できませんでした。"
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ fortune: text }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "予期せぬエラーが発生しました。",
            message: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}



