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

        const prompt = `あなたは世界最高峰の四柱推命鑑定師（Bazi Master）であり、運命を読み解く予言者でもあります。
提供された命式データに基づき、ユーザーの魂を震わせ、毎日アクセスせずにはいられないような圧倒的な情報量と深遠な洞察に満ちた詳細な鑑定を日本語で行ってください。

【鑑定の基本方針：文章の「圧」とボリューム】
1. **運勢鑑定の超強化**: 特に「これからの運勢」セクションは、現在の基準の50倍を目指す圧倒的な長文で記述してください。各期間（今日、明日、今週、今月、今年）について、日主の性質と巡る干支の相性を極限まで深掘りし、数千文字規模の圧倒的な「文章の圧力」で解説してください。
2. **専門用語の駆使**: 通変星、十二運、蔵干、身旺・身弱、喜神・忌神、格局などの概念を用い、「なぜその運勢なのか」という根拠を論理的かつ情熱的に伝えてください。
3. **記号の制限**: **「###」などのMarkdown見出し記号は一切使用しないでください。** 代わりに、太字（**）や適切な改行、空行を用いて構造化してください。
4. **今日のラッキーポイント**: 「今日の運勢」に関連して、以下の5つの具体的かつ動的なラッキー要素を必ず含めてください。

【出力項目（JSONフォーマットのキー名）】
1. "nature": 魂の本質。圧倒的長文で記述。
2. "social": 社会的な性質。圧倒的長文で記述。
3. "partner": 人生のパートナー。圧倒的長文で記述。
4. "fortunes": 以下の期間ごとの詳細な運勢。
    - "today": 今日の運勢。※この項目のみ、最後に "luckyPoints" オブジェクト（color, spot, food, item, action）を含めてください。
    - "tomorrow": 明日の運勢。
    - "thisWeek": 今週の波。
    - "thisMonth": 今月のテーマ。
    - "thisYear": 今年の大局。

必ず以下のJSON形式でのみ回答を出力してください。
{
  "nature": "【魂の設計図】\n\n(3000文字以上の詳細解説...)",
  "social": "【社会的使命】\n\n(3000文字以上の詳細解説...)",
  "partner": "【愛の結実】\n\n(3000文字以上の詳細解説...)",
  "fortunes": {
    "today": "【本日の運勢：圧倒的詳解】\n\n(2000文字以上の詳細解説...)",
    "luckyPoints": {
      "color": "ラッキーカラー",
      "spot": "ラッキースポット",
      "food": "ラッキーフード",
      "item": "ラッキーアイテム",
      "action": "今日のラッキーアクション"
    },
    "tomorrow": "【明日の運勢】\n\n(2000文字以上の詳細解説...)",
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



