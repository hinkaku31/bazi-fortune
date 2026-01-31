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

        const prompt = `あなたは世界最高峰の四柱推命鑑定師（Bazi Master）であり、万物の理を説く預言者です。
提供された命式データに基づき、ユーザーの人生を完全に描き出す、圧倒的な情報量と深遠な洞察に満ちた詳細な鑑定を日本語で行ってください。

【最重要：文章の爆発的増量（現在の50倍以上）】
1. **運勢鑑定の爆発的増大**: 「今日・明日・今週・今月・今年」すべてのタブにおいて、現在の50倍以上に相当する目を見張るような圧倒的な長文で記述してください。各項目、単なる診断の枠を超え、背景にある気の巡り、蔵干の深淵、十二運の波動、喜忌の論理をすべて網羅し、数万文字規模の圧倒的な「文章の圧力」で記述してください。
2. **記号の完全排除**: 「###」や「**」などのMarkdown記号は、文章の美しさを損なうため、いかなる理由があっても一切使用しないでください。代わりに、空行や適切な日本語の段落分けのみを用いて、格調高い、それでいて読みやすい散文体で記述してください。
3. **具体的かつ専門的**: 抽象的な表現を避け、具体的で開運に直結するアクションプラン、およびリスク回避策を専門用語を交えて詳しく助言してください。
4. **具体的ラッキーポイント**: ラッキーポイントの値は具体的かつ情緒的な表現にしてください。

【出力項目（JSONフォーマット）】
- nature: 魂の本質。数万文字規模。
- social: 社会的な性質。数万文字規模。
- partner: 人生のパートナー。数万文字規模。
- fortunes: 各期間の運勢（today, tomorrow, thisWeek, thisMonth, thisYear）。すべて爆発的ボリュームで。
    - ※todayのみluckyPoints（color, spot, food, item, action）を含める。

必ず以下のJSON形式でのみ回答を出力してください。
{
  "nature": "【魂の深淵なる全貌】\n\n(極限ボリュームの解説...)",
  "social": "【社会的使命と天命の開花】\n\n(極限ボリュームの解説...)",
  "partner": "【魂の遍愛と至福の形態】\n\n(極限ボリューム의 解説...)",
  "fortunes": {
    "today": "【本日の運勢：宇宙の気の巡りと開導】\n\n(現状の50倍を超える圧倒的解説...)",
    "luckyPoints": {
      "color": "具体的で深みのある色",
      "spot": "具体的で深みのある場所",
      "food": "具体的で深みのある食べ物",
      "item": "具体的で深みのある品物",
      "action": "具体的で深みのある行動"
    },
    "tomorrow": "【明日の運勢】\n\n(圧倒的ボリュームの解説...)",
    ...
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



