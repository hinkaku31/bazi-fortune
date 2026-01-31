export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { bazi, elements, topic, existingText } = body;

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
        const profileLabels = {
            nature: { title: "魂の本質", focus: "本質的性格、深層心理、生まれ持った業" },
            social: { title: "社会的使命", focus: "仕事運、適職の方向性、社会での立ち位置、対人関係" },
            partner: { title: "人生のパートナー", focus: "恋愛傾向、結婚運、理想の伴侶像、対人関係の深まり" },
            job_success: { title: "適職と成功の鍵", focus: "具体的な適職、才能の開花条件、金運、成功への最短ルート" }
        };

        if (profileLabels[topic]) {
            const { title, focus } = profileLabels[topic];
            prompt = `あなたは世界最高峰の泰山流四柱推命正統伝承者であり、数多の運命を導いてきた伝説の鑑定師です。
提供された命式データ（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）に基づき、ユーザーの「${title}」について、一冊の学術書に匹敵する圧倒的な情報密度と分量で鑑定してください。

【今回の鑑定焦点】
${focus} を中心に、これまでの全記録を凌駕する深さで記述してください。

【最重要指示：文字量の極限化】
この項目に対し、従来の鑑定の枠を遥かに超える、読み終わるまでに数十分を要するほどの圧倒的な「言葉の奔流」を注ぎ込んでください。短文や要約は一切禁止します。

【執筆ルール】
1. **圧倒的長文**: この項目だけでプロの鑑定書5ページ分以上の分量を記述。比喩表現、専門用語の解説、具体的な人生のシチュエーションを網羅してください。
2. **専門的・具体的解析**: 通変星、蔵干、十二運、空亡、格局、喜忌について、一切の手抜きなしでロジックに基づき記述してください。
3. **Markdown記号の完全排除**: 文字化けや表示崩れ防止のため、「**」「###」「- 」「* 」などのMarkdown記号は1つたりとも使用しないでください。強調は日本語の表現のみで行い、段落と改行のみで構成してください。
4. **JSONフォーマット**: 必ず以下の形式のJSONで回答してください。
{
  "content": "「${title}」の、魂を揺さぶるほど詳細で膨大な解説（超長文）..."
}
上記のようなJSON形式ではなく、**必ず純粋なテキストのみ（Markdown記号なし）**で直接回答を開始してください。
一冊の学術書に匹敵する情報量を、淀みなく出力し続けてください。`;
        } else {
            const labels = { today: '今日', tomorrow: '明日', thisWeek: '今週', thisMonth: '今月', thisYear: '今年' };
            const label = labels[topic] || topic;
            prompt = `あなたは星々の運命を司る最高位の占術師です。
この「${label}」という刻において、ユーザーに訪れる運命のすべてを、圧倒的な情報量で執筆してください。

提供された命式データ（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）に基づき、以下の指示に従ってください。

【最重要指示】
1. **純粋なテキスト（Markdownなし）**で直接回答してください。JSON形式は厳禁です。
2. 従来の3倍以上のボリュームで、具体性（行動、場所、バイオリズム）を極限まで高めてください。
3. 冗長な繰り返しを避け、常に新的で具体的な洞察を提供し続けてください。
4. **luckyPoints（todayのみ）**: 最後の一行に、以下の形式で具体的ラッキーポイントを記述してください。
[LUCKY]色:実在の色名,場所:実在のスポット名,食べ物:実在の料理名,アイテム:実在の持ち物名,アクション:実在の具体的行動[/LUCKY]

鑑定を開始します：`;
        }

        const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

        const systemPrompt = `あなたは世界最高峰の泰山流四柱推命正統伝承者です。
【厳守事項】
1. 冗長な繰り返しを避け、常に新的で具体的な情報を提供し続けてください。
2. Markdown記号（**, ###, -, *等）は絶対に使用せず、美しい日本語と改行のみで構成してください。
3. 読み手を圧倒する情報量と、魂を揺さぶる深い洞察を維持してください。`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${context.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: existingText
                            ? `以下の鑑定文の続きから執筆を再開してください。
前文の内容を繰り返さず、途切れた文脈を滑らかに繋いで、さらに深い洞察を続けてください。

【これまでの文章】
${existingText}

【指示】
この続きから、具体的かつ膨大な鑑定を再開してください：`
                            : prompt
                    }
                ],
                temperature: 0.7,
                stream: true // ストリーミングを有効化
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return new Response(JSON.stringify({ error: error.error?.message || 'APIエラー' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ストリームをそのままクライアントに返す
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
