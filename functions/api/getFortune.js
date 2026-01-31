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

        const prompt = `あなたはプロの四柱推命鑑定師です。以下の命式（四柱）と五行バランスを持つ方の【本質】【社会的性質】【人生のパートナー】、および【運勢診断（今日・明日・今週・今月・今年）】を詳細に鑑定してください。

【命式】
年柱: ${bazi.nenchuu}
月柱: ${bazi.gecchuu}
日柱: ${bazi.nicchuu}
時柱: ${bazi.jichuu}

【五行バランス】
${JSON.stringify(elements)}

【鑑定依頼内容】
1. あなたの本質：日主の干支を中心に、性格、才能、内面的な強みを1000文字程度で。
2. 社会的な性質：月支を中心に、仕事運、適職、社会での立ち回りを1000文字程度で。
3. 人生のパートナー：日支を中心に、惹かれるタイプ、理想の結婚像、関係維持のアドバイスを1000文字程度で。
4. 運勢診断：現在を起点に、今日、明日、今週、今月、今年の計5項目をそれぞれ300文字程度で。

【出力形式】
JSON形式のみで出力してください。Markdownヘッダーや「###」は含めず、純粋なテキストとして各項目を構成してください。
{
  "nature": "...",
  "social": "...",
  "partner": "...",
  "fortunes": {
    "today": "...",
    "tomorrow": "...",
    "thisWeek": "...",
    "thisMonth": "...",
    "thisYear": "..."
  }
}`;

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
                    { role: "system", content: "You are a professional Bazi master. Always respond in Japanese. Output must be valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
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

        const content = JSON.parse(data.choices?.[0]?.message?.content);

        return new Response(JSON.stringify(content), {
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



