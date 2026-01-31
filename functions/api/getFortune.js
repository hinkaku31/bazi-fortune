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

        const systemPrompt = `あなたは現実世界で数多の成功者を輩出してきた「伝説の鑑定士」です。
【鑑定の掟：絶対厳守】
1. 抽象論の禁止：「宇宙」「エネルギー」「波動」といった曖昧な言葉は極力排除し、「仕事」「金銭」「人間関係」「健康」といった現実的な言葉で語ってください。
2. 断定と具体性：推測ではなく、命式から読み取れる「決定した事実」として伝え、明日から実行できる具体的な行動を指示してください。
3. 専門用語の血肉化：専門用語（空亡、干合など）をそのまま出すのではなく、それが人生のどのような具体的なシーン（昇進、別れ、病気、臨時収入）として現れるかを執筆してください。
4. 圧倒的熱量：プロの鑑定士が目の前で魂を込めて語りかけているような、鋭くも温かい「です・ます」調で記述してください。
5. 完全な日本語：文末の切れ、助詞の抜け、誤字脱字がないか、出力前に自ら厳しくチェックし、美しい日本語で統一してください。`;

        if (topic === 'nature' || topic === 'social' || topic === 'partner' || topic === 'job_success') {
            const title = labels[topic];
            let specificInstruction = "";

            if (topic === 'nature') {
                specificInstruction = `【本質（日主）の鑑定】
ここでは「個人の内面、精神性、無意識の反応」に特化して記述せよ。仕事や対人関係の話は他でするため、ここでは「自分自身との向き合い方」「魂の満たし方」に集中すること。`;
            } else if (topic === 'social') {
                specificInstruction = `【社会的使命（月支）の鑑定】
ここでは「仕事場での評価、リーダーシップ、集団内での振る舞い」に特化して記述せよ。内面の話は不要。「どうすれば社会で勝ち上がれるか」「周囲からどう見られているか」に集中すること。`;
            } else if (topic === 'partner') {
                specificInstruction = `【パートナー（日支）の鑑定】
ここでは「恋愛、結婚、家庭」に特化して記述せよ。仕事の話は厳禁。「どのような異性を求めるか」「結婚後の家庭像」「陥りやすい恋愛トラブル」に集中すること。`;
            } else if (topic === 'job_success') {
                specificInstruction = `【適職と成功（時支）の鑑定】
ここでは「具体的な職業適性、金運、成功の条件」に特化して記述せよ。精神論は不要。「どの業界に行くべきか」「どうやって資産を築くか」に集中すること。`;
            }

            prompt = `伝説の鑑定士よ、この者の命式（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）を読み解き、以下の四部構成で「現実的真実」だけを5000文字の気迫で書き尽くしなさい。

${specificInstruction}

1. あなたの宿命：日主と月令の関係から、現実社会で戦うための武器（長所）と弱点（短所）を断定する。
2. 具体的性格：干合や蔵干の並びがもたらす、具体的な行動パターンや思考の癖を暴き出す。
3. 人生の課題：空亡や十二運の象意を、人生の具体的な危機（倒産、離婚、病気など）として予言し、回避策を示す。
4. 開運の鍵：喜神・忌神に基づき、明日から「何を捨て、何を拾うべきか」を具体的に指示する。

占い方の解説は一切不要。抽象的な精神論ではなく、血の通った現実的アドバイスで魂を揺さぶりなさい。執筆開始：`;
        } else {
            const label = labels[topic] || topic;
            prompt = `伝説の鑑定士よ、この「${label}」という刻印に対し、この者が歩むべき唯一の正解を、これまでの40倍の解像度とボリュームで提示しなさい。

命式データ（${JSON.stringify(bazi)}）と五行（${JSON.stringify(elements)}）を背景に、単なる予測ではなく、この瞬間に現実世界でこの者に求めている「具体的行動」と「訪れる激変」を書き尽くしなさい。

【執筆の掟：40倍の熱量】
- 抽象表現（宇宙、波動など）は禁止。仕事、金、人、健康について具体的に語れ。
- **独白スタイル**: プロの鑑定士が憑依したかのように、息つく暇もないほどの長文で、しかし一文字も無駄なく語り続けよ。
- **完全な日本語**: 文末の欠け（「〜です」が「〜で」になる等）は許されない。完璧な文章で出力せよ。
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
文末が途切れている場合は、その単語を補完してから続きを書き始めること。

【これまでの文章】
${existingText}

【指示】
この続きから、さらに5000文字の熱量で鑑定を完遂せよ（文字欠け厳禁）：`
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
