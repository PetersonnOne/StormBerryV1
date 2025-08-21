const translations = {
  education: {
    title: '教育モジュール',
    input: {
      text: {
        label: '質問する',
        placeholder: 'ここに質問を入力してください...',
        submit: '送信',
        error: '有効な質問を入力してください',
      },
      voice: {
        start: '録音開始',
        stop: '録音停止',
        processing: '音声を処理中...',
        error: '音声入力の処理中にエラーが発生しました',
        permission: 'マイクの使用を許可してください',
      },
      image: {
        select: '画像を選択',
        upload: 'アップロード',
        processing: '画像を処理中...',
        error: '画像のアップロード中にエラーが発生しました',
        format: '対応フォーマット：JPG、PNG、GIF',
        size: '最大ファイルサイズ：5MB',
      },
    },
    lesson: {
      loading: 'レッスンを読み込み中...',
      error: 'レッスンの読み込み中にエラーが発生しました',
      next: '次へ',
      previous: '前へ',
      complete: 'レッスン完了',
      progress: '進捗：{{completed}}/{{total}}',
    },
    quiz: {
      title: 'クイズ',
      start: 'クイズを開始',
      next: '次の問題',
      submit: '回答を送信',
      result: 'クイズ結果',
      score: 'あなたのスコア：{{score}}/{{total}}',
      retry: 'もう一度挑戦',
      loading: 'クイズを読み込み中...',
      error: 'クイズの読み込み中にエラーが発生しました',
      explanation: '解説',
      correct: '正解！',
      incorrect: '不正解',
    },
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      save: '保存',
      cancel: 'キャンセル',
      close: '閉じる',
      success: '成功',
      warning: '警告',
      info: '情報',
    },
    offline: {
      status: 'オフラインです',
      limited: '制限された機能のみ利用可能です',
      sync: 'オンライン時に同期します',
    },
  },
};

export default translations;