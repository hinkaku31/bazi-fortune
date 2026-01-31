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

        if (!env.OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({
                error: "APIキー (OPENROUTER_API_KEY) が設定されていません。"
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
            thisYear: '今年の運勢'
        };

        const systemPrompt = `あなたは現実世界で数多の成功者を輩出してきた「伝説の鑑定士」です。
【鑑定の掟：絶対厳守】
1. データの完全遵守：提供された命式（日主：${bazi.nicchuu[0]}、月支：${bazi.gecchuu[1]}）を絶対の正解とし、推測で異なる星を語ることは厳禁です。「身弱」なら「身弱」、「${bazi.nicchuu[0]}」なら「${bazi.nicchuu[0]}」として鑑定してください。
2. 抽象論の禁止：「宇宙」「エネルギー」といった言葉は捨て、「仕事」「金銭」「人間関係」「健康」について具体的に語ってください。
3. 断定と具体性：推測ではなく、命式から読み取れる「決定した事実」として伝え、明日から実行できる具体的な行動を指示してください。
4. 圧倒的熱量：プロの鑑定士が目の前で魂を込めて語りかけているような、鋭くも温かい「です・ます」調で記述してください。
5. 完全な日本語：文末の切れ、助詞の抜け、誤字脱字がないか、出力前に自ら厳しくチェックし、美しい日本語で統一してください。`;

        if (topic === 'nature' || topic === 'social' || topic === 'partner' || topic === 'job_success') {
            const title = labels[topic];
            let specificInstruction = "";
            let dataFocus = "";

            if (topic === 'nature') {
                specificInstruction = `【本質（日主：${bazi.nicchuu[0]}）の鑑定】
「個人の内面、精神性」に特化。仕事や対人関係の話は他でするため、ここでは「自分自身との向き合い方」に集中すること。`;
                dataFocus = "日主（生まれた日の干）と月令の関係性を最重要視せよ。";
            } else if (topic === 'social') {
                specificInstruction = `【社会的使命（月支：${bazi.gecchuu[1]}）の鑑定】
「仕事場での評価、リーダーシップ」に特化。内面の話は不要。「どうすれば社会で勝ち上がれるか」に集中すること。`;
                dataFocus = "月支（生まれた月の支）を通変星に変換し、社会運を分析せよ。";
            } else if (topic === 'partner') {
                specificInstruction = `【パートナー（日支：${bazi.nicchuu[1]}）の鑑定】
「恋愛、結婚、家庭」に特化。仕事の話は厳禁。「どのような異性を求めるか」「結婚後の家庭像」に集中すること。`;
                dataFocus = "日支（配偶者の座）と日主の干合関係を分析せよ。";
            } else if (topic === 'job_success') {
                specificInstruction = `【適職と成功（時支：${bazi.jichuu[1]}）の鑑定】
「具体的な職業適性、金運」に特化。精神論は不要。「どの業界に行くべきか」「どうやって資産を築くか」に集中すること。`;
                dataFocus = "時柱（晩年・成果）と全体の五行バランスから適職を導き出せ。";
            }

            prompt = `伝説の鑑定士よ、この者の命式（日主：${bazi.nicchuu[0]}）を正しく読み取り、以下の四部構成で「真実」を驚くほど短く、鋭く記述しなさい。

【重要：超凝縮・省エネモード】
長文は厳禁である。**全体で200〜300文字以内**に凝縮せよ。
各項目を「一言（30文字程度）」で鋭く断言し、無駄な修飾語はすべて削ぎ落とせ。

【重要：データ整合性】
${dataFocus}
入力されたデータ以外の星を語ることは許されない。

${specificInstruction}

1. あなたの宿命：現世での役割を一言で断定せよ。
2. 具体的性格：思考の癖を一言で暴け。
3. 人生の課題：訪れる危機を一言で予言せよ。
4. 開運の鍵：明日からの行動を一言で指示せよ。

占い方の解説は一切不要。俳句のように鋭く、本質だけを突き刺せ。執筆開始：`;
        } else {
            const label = labels[topic] || topic;
            let timeFocus = "";
            let volumeInstruction = "";

            if (topic === 'today') {
                volumeInstruction = "【特別指示：圧倒的熱量とボリューム】\n「今日の運勢」はユーザーが最も求めている。省略することなく、40倍の解像度で、一日の時間の流れを詳細に書き尽くせ。";
                timeFocus = "「今日この24時間」に起きる具体的な出来事と、時間帯別のアドバイス";
            } else {
                // 明日〜などは少し抑えるが、それでも充実させる
                volumeInstruction = "【指示：充実した鑑定】\nしっかりと具体的なアドバイスを行い、読者を満足させよ。";
                if (topic === 'tomorrow') timeFocus = "「明日」訪れる具体的なチャンスと、準備すべきこと";
                else if (topic === 'thisWeek') timeFocus = "「今週（月〜日）」の具体的なスケジュールごとの運気推移";
                else if (topic === 'thisMonth') timeFocus = "「今月」の大きな目標と、週ごとの浮き沈み";
                else if (topic === 'thisYear') timeFocus = "「今年」達成すべきグランドスラムと、季節ごとの重要イベント";
            }

            prompt = `伝説の鑑定士よ、この「${label}」という刻印に対し、この者が歩むべき唯一の正解を提示しなさい。

命式データ（日主：${bazi.nicchuu[0]}、五行傾向：${JSON.stringify(elements)}）を背景に、${timeFocus}について書き尽くしなさい。

${volumeInstruction}
- 抽象表現（宇宙、波動など）は禁止。仕事、金、人、健康について具体的に語れ。
- **独白スタイル**: プロの鑑定士が憑依したかのように語れ。
- **完全な日本語**: 文末の欠け（「〜です」が「〜で」になる等）は許されない。完璧な文章で出力せよ。
- **luckyPoints（todayのみ）**: 最後の一行にのみ、以下の形式で具体的ラッキーポイントを記述せよ。
[LUCKY]色:実在の色名,場所:実在のスポット名,食べ物:実在の料理名,アイテム:実在の持ち物名,アクション:実在の具体的行動[/LUCKY]

鑑定を開始せよ：`;
        }

        // リトライ機能付きのフェッチ処理（タイムアウト延長 60秒）
        const fetchWithRetry = async (url, options, retries = 3, backoff = 2000) => {
            for (let i = 0; i < retries; i++) {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 60000); // 60秒タイムアウト

                try {
                    const response = await fetch(url, { ...options, signal: controller.signal });
                    clearTimeout(id);

                    if (response.ok) {
                        console.log(`[API Success] Status: ${response.status}`);
                        return response;
                    }

                    // エラー時のみ本文を読み取る
                    if (response.status === 429 || response.status >= 500) {
                        const errorText = await response.text();
                        console.warn(`[API Error] Attempt ${i + 1} failed: Status ${response.status}`, errorText);
                        await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
                        continue;
                    }

                    // その他のエラー（400等）はそのまま返す（呼び出し元で処理）
                    return response;
                } catch (error) {
                    clearTimeout(id);
                    console.warn(`[Network Error] Attempt ${i + 1}:`, error);
                    await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
                }
            }
            throw new Error(`Failed to fetch after ${retries} retries`);
        };

        const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${context.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://github.com/hinkaku31/bazi-fortune',
                'X-Title': 'Bazi Fortune Teller',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1:free',
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
この続きから、さらに熱量を持って鑑定を完遂せよ（文字欠け厳禁・データ整合性厳守）：`
                            : prompt
                    }
                ],
                temperature: 0.7,
                stream: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return new Response(JSON.stringify({ error: error.error?.message || 'APIエラー' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const reader = response.body.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        // ストリーミング処理の堅牢化（バックグラウンド実行）
        context.waitUntil((async () => {
            let buffer = "";
            let inThought = false; // <thought>タグ内かどうかのフラグ

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // 最後の不完全な行をバッファに残す

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        if (line.trim() === 'data: [DONE]') continue;

                        if (line.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(line.slice(6));
                                // DeepSeek R1の思考プロセス(reasoning)を除外し、コンテンツのみ抽出
                                let content = json.choices[0]?.delta?.content || "";

                                // <thought>タグの除去ロジック
                                if (content) {
                                    // タグの開始を検知
                                    if (content.includes('<thought>')) {
                                        inThought = true;
                                        content = content.replace(/<thought>[\s\S]*/, '');
                                    }

                                    // タグの終了を検知
                                    if (inThought) {
                                        if (content.includes('</thought>')) {
                                            inThought = false;
                                            content = content.replace(/[\s\S]*<\/thought>/, '');
                                        } else {
                                            content = ""; // タグ内なので全て無視
                                        }
                                    } else {
                                        // 通常のタグ除去（一行に含まれる場合）
                                        content = content.replace(/<thought>[\s\S]*?<\/thought>/g, '');
                                    }

                                    if (content) {
                                        await writer.write(encoder.encode(content));
                                    }
                                }
                            } catch (e) {
                                console.warn("[Stream Parse Error] Ignoring chunk:", e.message, "Line:", line);
                                // 無視して次へ
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("[Fatal Stream Error]", err);
                // エラーをクライアントに通知する手段があれば良いが、ここではログ出力に留める
                // クライアント側でタイムアウトまたはエラーハンドリングが行われる
            } finally {
                await writer.close();
            }
        })());

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (error) {
        console.error('[getFortune API Error]', error);
        console.error('Error stack:', error.stack);
        return new Response(JSON.stringify({
            error: error.message || '予期しないエラーが発生しました',
            details: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
