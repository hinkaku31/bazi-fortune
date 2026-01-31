export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { bazi, elements, topic } = body;

        if (!bazi || !elements || !topic) {
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
            prompt = `あなたは世界最高峰の泰山流四柱推命正統伝承者であり、数多の運命を導いてきた伝説の鑑定師です。
提供された命式データ（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）に基づき、ユーザーの「魂の本質」「社会的使命」「人生のパートナー」について、一冊の学術書に匹敵する圧倒的な情報密度と分量で鑑定してください。

【最重要指示：文字量の極限化】
各項目（本質、使命、パートナー）に対し、従来の鑑定の枠を遥かに超える、読み終わるまでに数十分を要するほどの圧倒的な「言葉の奔流」を注ぎ込んでください。短文や要約は一切禁止します。

【執筆ルール】
1. **圧倒的長文**: 各項目、プロの鑑定書5ページ分以上の分量を記述。比喩表現、専門用語の解説、時代背景、具体的な人生のシチュエーションを網羅してください。
2. **専門的・具体的解析**: 通変星の相剋、蔵干の深層、十二運、空亡、神殺、喜忌、格局について、一切の手抜きなしで複雑に絡み合う運命を紐解いてください。
3. **Markdown記号の完全排除**: 文字化けや表示崩れ防止のため、「**」「###」「- 」「* 」などのMarkdown記号は1つたりとも使用しないでください。強調は日本語の表現のみ（「まさに〜」「極めて〜」等）で行い、段落と改行のみで読みやすく構成してください。
4. **JSONフォーマット**: 必ず以下の形式のJSONで回答してください。
{
  "nature": "魂の本質の、文字通り底なしに深い解説（超長文）...",
  "social": "社会的使命の、魂を揺さぶるほど詳細な解説（超長文）...",
  "partner": "人生のパートナーとの宿命的関係の完全網羅（超長文）..."
}`;
        } else {
            const labels = { today: '今日', tomorrow: '明日', thisWeek: '今週', thisMonth: '今月', thisYear: '今年' };
            const label = labels[topic] || topic;
            prompt = `あなたは運命を司る最高位の占術師であり、星々の瞬きから一寸の狂いもなく未来を見通す預言者です。
この「${label}」という一瞬の刻において、ユーザーに訪れる運命のすべてを、これまでの全記録を凌駕する超絶的な情報量で執筆してください。

【最重要指示：3倍以上の文章量】
この「${label}」の運勢だけに焦点を絞り、従来の最大出力の3倍、文字にして数万文字に及ぶ「圧倒的な言葉の壁」を構築してください。

【執筆ルール】
1. **極限のディテール**: 1日のバイオリズムの変化、出会うべき人の特徴、避けるべき方角、具体的なラッキーアクションの裏付け、運命の分岐点となる瞬間まで、顕微鏡で覗くような細かさで延々と記述してください。
2. **専門性の徹底**: 四柱推命（地支の刑冲会合、月令の強弱など）のロジックを背景に、なぜそのような運勢になるのかを理論的に、かつ情緒豊かに解説してください。
3. **ループ・繰り返し禁止**: 同じ結論を繰り返して文字数を稼ぐことは厳禁です。常に新しい視点と具体的な助言を提示し続けてください。
4. **Markdown記号の完全排除**: 「**」「###」「##」「*」等は絶対に使用不可。美しい日本語と適切な段落、改行のみで構成してください。
5. **ラッキーポイント（todayのみ）**: topicがtodayの場合、最後に具体的で具体的な「luckyPoints」（color, spot, food, item, action）を、装飾記号なしの純粋なテキストのみで含めてください。
6. **JSONフォーマット**: 必ず以下の形式のJSONで回答してください。
{
  "content": "${label}の運勢の、宇宙の深淵に触れるような超絶詳細解説（超長文）...",
  "luckyPoints": { "color": "純粋な色名1つ", "spot": "純粋な場所名1つ", "food": "純粋な食べ物名1つ", "item": "純粋な持ち物名1つ", "action": "純粋な行動1つ" } (todayの場合のみ)
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



