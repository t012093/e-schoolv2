import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, profile } = await request.json()

    // OpenAI API キーの確認
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // APIキーがない場合は模擬応答を返す
      return NextResponse.json({
        message: generateMockResponse(messages[messages.length - 1]?.content, profile),
        type: 'mock'
      })
    }

    // システムプロンプトの作成（プロフィールに基づいてパーソナライズ）
    const systemPrompt = generateSystemPrompt(profile)

    // OpenAI API呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content || 'すみません、応答の生成に失敗しました。'

    return NextResponse.json({
      message: aiMessage,
      type: 'ai'
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: '申し訳ございません。エラーが発生しました。' },
      { status: 500 }
    )
  }
}

function generateSystemPrompt(profile?: any): string {
  let prompt = `あなたは親切で知識豊富なAI学習コーチです。ユーザーの学習を全力でサポートしてください。

基本方針:
- 親しみやすく、励ましの言葉を交えながら話してください
- 具体的で実践的なアドバイスを提供してください
- 質問には明確に答え、必要に応じて追加の提案をしてください
- 日本語で丁寧に対応してください`

  if (profile) {
    prompt += `\n\nユーザープロフィール:`

    if (profile.learningStyle?.primaryStyle) {
      const style = profile.learningStyle.primaryStyle
      if (style === 'visual') {
        prompt += `\n- 学習スタイル: 視覚型（図表、マインドマップ、色分けなどを好む）`
      } else if (style === 'auditory') {
        prompt += `\n- 学習スタイル: 聴覚型（音読、討論、音声教材を好む）`
      } else {
        prompt += `\n- 学習スタイル: 体感型（実践、演習、手を動かす学習を好む）`
      }
    }

    if (profile.motivation?.motivationType) {
      const type = profile.motivation.motivationType
      if (type === 'autonomous') {
        prompt += `\n- 動機付けタイプ: 自律型（自己主導的な学習を好む）`
      } else if (type === 'controlled') {
        prompt += `\n- 動機付けタイプ: サポート重視型（外的サポートが効果的）`
      } else {
        prompt += `\n- 動機付けタイプ: バランス型`
      }
    }

    if (profile.personality?.conscientiousness > 70) {
      prompt += `\n- 性格特性: 計画性が高い（詳細なスケジュールと進捗管理が向いている）`
    }
  }

  prompt += `\n\nこれらの特性を考慮して、ユーザーに最適なアドバイスを提供してください。`

  return prompt
}

function generateMockResponse(userMessage: string, profile?: any): string {
  const input = userMessage?.toLowerCase() || ''

  if (input.includes('こんにちは') || input.includes('はじめまして')) {
    return 'こんにちは！AI学習コーチです。今日はどのようなサポートが必要ですか？'
  }

  if (input.includes('ありがとう')) {
    return 'どういたしまして！学習の成功を全力でサポートします。他にも何かありましたらお気軽にどうぞ。'
  }

  if (input.includes('モチベーション') || input.includes('やる気')) {
    return '学習のモチベーション維持には、小さな目標を設定して達成感を積み重ねることが効果的です。また、学習の目的を明確にし、進捗を可視化することもおすすめです。'
  }

  if (input.includes('学習方法') || input.includes('勉強')) {
    if (profile?.learningStyle?.primaryStyle === 'visual') {
      return '視覚的学習が得意なあなたには、マインドマップや図表を使った整理がおすすめです。色分けやハイライトも効果的ですよ。'
    }
    return '効果的な学習には、定期的な復習と実践が重要です。ポモドーロテクニック（25分集中+5分休憩）も試してみてください。'
  }

  return 'ご質問ありがとうございます。より詳しくサポートするために、具体的にどのようなことでお困りか教えていただけますか？'
}
