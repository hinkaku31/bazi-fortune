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

【鑑定の基本方針：極限の「圧」とボリューム】
1. **運勢鑑定の極限強化**: 「今日・明日・今週・今月・今年」すべてのタブにおいて、現在のさらに2倍、初期状態からは100倍に相当する圧倒的な長文で記述してください。各項目、プロの鑑定書数ページ分に匹敵する数千文字規模の「文章の圧力」で、四柱推命の重層的なロジック（蔵干、十二運、喜忌、格局）を網羅してください。
2. **論理的根拠と開運の全貌**: 単なる吉凶ではなく、「なぜその運勢なのか」という根拠と、具体的リスク、そして運命を切り拓くための詳細なアクションプランを記述してください。
3. **記号・絵文字の完全排除**: **「###」などのMarkdown見出し記号は一切使用しないでください。** また、絵文字も一切使用せず、格調高いテキストのみで構成してください。構造化は、太字（**）と適切な改行・空行のみで行ってください。
4. **具体的ラッキーポイント**: ラッキーポイントの各値は、抽象的ではなく「具体的」かつ「詩的・専門的」な表現（例：「真紅」ではなく「深秘の紅」、「寺」ではなく「静寂の漂う古刹」など）にしてください。

【出力項目（JSONフォーマットのキー名）】
1. "nature": 魂の本質。数千文字の極限長文。
2. "social": 社会的な性質。数千文字の極限長文。
3. "partner": 人生のパートナー。数千文字の極限長文。
4. "fortunes": 以下の期間ごとの詳細な運勢。
    - "today": 今日の運勢。※最後に "luckyPoints"（color, spot, food, item, action）を具体的テキストで。
    - "tomorrow": 明日の運勢。
    - "thisWeek": 今週の波。
    - "thisMonth": 今月のテーマ。
    - "thisYear": 今年の大局。

必ず以下のJSON形式でのみ回答を出力してください。
{
  "nature": "【魂の深淵なる青写真：本質と潜在能力の全貌】\n\n(5000文字以上の極限解説...)",
  "social": "【社会的使命と天命の開花：成功への絶対的軌跡】\n\n(5000文字以上の極限解説...)",
  "partner": "【魂の遍愛：求め合う伴侶と家庭における至福の形態】\n\n(5000文字以上の極限解説...)",
  "fortunes": {
    "today": "【本日の運勢：極限詳解と開導】\n\n(3000文字以上の徹底解説...)",
    "luckyPoints": {
      "color": "具体的で深みのある色",
      "spot": "具体的で深みのある場所",
      "food": "具体的で深みのある食べ物",
      "item": "具体的で深みのある品物",
      "action": "具体的で深みのある行動"
    },
    "tomorrow": "【明日の運勢：次なる気の巡りと備え】\n\n(3000文字以上の徹底解説...)",
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



