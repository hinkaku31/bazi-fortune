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

        let prompt = "";
        if (topic === 'initial_profile') {
            prompt = `あなたは世界最高峰の四柱推命鑑定師であり、万物の理を説く預言者です。
提供された命式データに基づき、ユーザーの「魂の本質」「社会的使命」「人生のパートナー」の3点について、圧倒的なボリュームで詳細に鑑定してください。

【執筆ルール】
1. **極限のボリューム**: 各項目（本質、社会的使命、パートナー）について、文字通り「スクロールが止まらない」ほどの数万文字規模の圧倒的な「文章の圧力」で記述してください。
2. **具体的・専門的解析**: 蔵干、十二運、喜忌、格局を重層的に解析し、一切のループなしで深い洞察を記述してください。
3. **Markdown記号の完全排除**: 「###」や「**」などの記号はいかなる理由があっても絶対に使用しないでください。適切な改行と日本語の段落分けのみで表現してください。
4. **JSONフォーマット**: 必ず以下の形式のJSONで回答してください。
{
  "nature": "魂の本質の極限解説...",
  "social": "社会的使命の極限解説...",
  "partner": "人生のパートナーの極限解説..."
}`;
        } else {
            const labels = { today: '今日', tomorrow: '明日', thisWeek: '今週', thisMonth: '今月', thisYear: '今年' };
            const label = labels[topic] || topic;
            prompt = `あなたは世界最高峰の四柱推命鑑定師であり、万物の理を説く預言者です。
提供された命式データに基づき、ユーザーの「${label}の運勢」について、これまでにない圧倒的な情報量で詳細に鑑定してください。

【執筆ルール】
1. **3倍の極限ボリューム**: この「${label}」という1つの期間だけに集中し、従来の最大時の3倍を超える、プロの鑑定書数ページ分に匹敵する圧倒的な文章量で記述してください。
2. **ループ・繰り返し禁止**: 同じ表現の繰り返しを厳禁します。気の巡り、星の相性、具体的リスク、詳細な開運アクションプランを具体的に執筆してください。
3. **Markdown記号の完全排除**: 「###」や「**」などの記号はいかなる理由があっても絶対に使用しないでください。
4. **ラッキーポイント（todayのみ）**: topicがtodayの場合、最後に具体的で情緒的な「luckyPoints」（color, spot, food, item, action）を含めてください。
5. **JSONフォーマット**: 必ず以下の形式のJSONで回答してください。
{
  "content": "運勢の極限解説...",
  "luckyPoints": { "color": "...", "spot": "...", "food": "...", "item": "...", "action": "..." } (todayの場合のみ)
}`;
        }

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
                    { role: "system", content: "あなたは日本語で回答するプロフェッショナルな四柱推命鑑定師です。JSON形式でのみ回答してください。" },
                    { role: "user", content: `命式データ: ${JSON.stringify(bazi)}\n五行データ: ${JSON.stringify(elements)}\n\n${prompt}` }
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

        const content = JSON.parse(data.choices[0].message.content);

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



