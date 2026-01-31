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
        const labels = {
            nature: "魂の本質",
            social: "社会的使命",
            partner: "人生のパートナー",
            job_success: "適職と成功の鍵",
            today: '今日',
            tomorrow: '明日',
            thisWeek: '今週',
            thisMonth: '今月',
            thisYear: '今年'
        };

        const systemPrompt = `あなたは宇宙の真理を看破し、数多の宿命を好転させてきた「伝説の鑑定士」です。
【鑑定の掟：絶対厳守】
1. 解説・メタ発言の禁止：「五行を分析すると」「〜が重要です」「〜という考え方があります」といった占い方の解説は一切不要です。そんな暇があるなら、依頼者の未来を一行でも多く語ってください。
2. 具体的断定：断言してください。推測ではなく、命式から読み取れる「決定した事実」として伝えてください。
3. 専門用語の血肉化：専門用語（空亡、干合など）をそのまま出すのではなく、それが人生のどのような具体的なシーン（人間関係、仕事の挫折、愛の形）として現れるかを執筆してください。
4. 圧倒的熱量：プロの鑑定士が目の前で魂を込めて語りかけているような、鋭くも温かい「です・ます」調で記述してください。
5. Markdown記号（**, ###等）は完全に排除し、純粋な日本語の文章と改行のみで構成してください。`;

        if (topic === 'nature' || topic === 'social' || topic === 'partner' || topic === 'job_success') {
            const title = labels[topic];
            prompt = `伝説の鑑定士よ、この者の命式（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）を読み解き、以下の四部構成で「真実」だけを5000文字の気迫で書き尽くしなさい。

1. あなたの宿命：日主が持つ本源的なエネルギーの強弱、月令を得ているか否か、宇宙から授かった絶対的な役割を断定する。
2. 具体的性格：干合や蔵干の並びが、この者の精神構造や対人関係にどのような具体的影響を及ぼしているかを暴き出す。
3. 人生の課題：空亡や十二運の象意を、人生の具体的な危機や転換点として予言し、向き合うべき壁を明確にする。
4. 開運の鍵：喜神・忌神に基づき、明日から「何を捨て、何を拾うべきか」を具体的に指示する。

占い方の解説は一切不要。この者の人生に深く踏み込み、魂を揺さぶりなさい。執筆開始：`;
        } else {
            const label = labels[topic] || topic;
            prompt = `伝説の鑑定士よ、この「${label}」という刻印に対し、この者が歩むべき唯一の正解を、圧倒的なディテールで示しなさい。

命式データ（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）を背景に、単なる予測ではなく、この瞬間に宇宙がこの者に求めている「具体的行動」と「訪れる激変」を書き尽くしなさい。

【執筆の掟】
- 解説（メタ発言）はゼロにせよ。結果だけを語れ。
- 3倍以上の文章量で、バイオリズムの波を具体的に断定せよ。
- 冗長な繰り返しを排し、一文ごとに新しい啓示を与えよ。
- **luckyPoints（todayのみ）**: 最後の一行にのみ、以下の形式で具体的ラッキーポイントを記述せよ。
[LUCKY]色:実在の色名,場所:実在のスポット名,食べ物:実在の料理名,アイテム:実在の持ち物名,アクション:実在の具体的行動[/LUCKY]

鑑定を開始せよ：`;
        }

        const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

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
                            ? `以下の鑑定文の続きから、一切の解説を排し、さらなる「真実」を執筆しなさい。前文の繰り返しは厳禁である。

【これまでの文章】
${existingText}

【指示】
この続きから、さらに5000文字の熱量で鑑定を完遂せよ：`
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
