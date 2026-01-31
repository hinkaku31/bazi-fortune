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

        const prompt = `あなたは世界最高峰の四柱推命鑑定師（Bazi Master）であり、心理学的、哲学的視点も兼ね備えた唯一無二の存在です。
提供された命式データに基づき、ユーザーが「自分の人生を深く理解できた」と魂の底から感じるような、圧倒的な情報量と深遠な洞察に満ちた詳細な鑑定を日本語で行ってください。

【鑑定の基本方針】
1. **テキスト量**: 各セクションで現在の約10倍、各項目最低でも1000文字〜1500文字程度の重厚かつ緻密な解説を行ってください。
2. **専門性**: 通変星、十二運、蔵干、身旺・身弱、喜神・忌神、格局、造化元鑰、滴天髄などの伝統的かつ専門的な概念を駆使し、論理的かつ情熱的に解説してください。
3. **構成**: 各セクションはMarkdown形式（### 見出しなど）を使用し、構造化された長文として出力してください。
4. **トーン**: 格調高く、かつユーザーに寄り添う温かみのあるプロフェッショナルな口調。

【鑑定データ】
年柱: ${bazi.nenchuu}
月柱: ${bazi.gecchuu}
日柱: ${bazi.nicchuu}
時柱: ${bazi.jichuu}
五行バランス: ${JSON.stringify(elements)}

【出力項目（JSONフォーマットのキー名）】
1. "nature": 魂の本質。日主（十干）の特性、五行の強弱、性格の多面性、潜在能力、人生の根本的テーマについて。
2. "social": 社会的な性質。月柱を中心に、適職、組織内での立ち回り、成功への道筋について。
3. "partner": 人生のパートナー。日支を中心に、理想の縁、恋愛の傾向、家族形成について。
4. "fortunes": 以下の期間ごとの詳細な運勢（各300文字以上）。
    - "today": 今日の運勢。
    - "tomorrow": 明日の運勢。
    - "thisWeek": 今週の波。
    - "thisMonth": 今月のテーマ。
    - "thisYear": 今年の大局。

必ず以下のJSON形式でのみ回答を出力してください。
{
  "nature": "### 魂の設計図：本質と潜在能力\n\n(1500文字以上の詳細解説...)",
  "social": "### 社会的使命：才能の開花と成功への軌跡\n\n(1500文字以上の詳細解説...)",
  "partner": "### 愛の結実：魂が求める伴侶と理想の家庭\n\n(1500文字以上の詳細解説...)",
  "fortunes": {
    "today": "今日の運勢詳細...",
    "tomorrow": "明日の運勢詳細...",
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



