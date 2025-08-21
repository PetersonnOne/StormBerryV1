const translations = {
  education: {
    title: '教育模块',
    input: {
      text: {
        label: '提问',
        placeholder: '在此输入您的问题...',
        submit: '提交',
        error: '请输入有效的问题',
      },
      voice: {
        start: '开始录音',
        stop: '停止录音',
        processing: '正在处理语音...',
        error: '处理语音输入时出错',
        permission: '请允许使用麦克风',
      },
      image: {
        select: '选择图片',
        upload: '上传',
        processing: '正在处理图片...',
        error: '上传图片时出错',
        format: '支持的格式：JPG、PNG、GIF',
        size: '最大文件大小：5MB',
      },
    },
    lesson: {
      loading: '正在加载课程...',
      error: '加载课程时出错',
      next: '下一步',
      previous: '上一步',
      complete: '完成课程',
      progress: '进度：{{completed}}/{{total}}',
    },
    quiz: {
      title: '测验',
      start: '开始测验',
      next: '下一题',
      submit: '提交答案',
      result: '测验结果',
      score: '您的得分：{{score}}/{{total}}',
      retry: '重试',
      loading: '正在加载测验...',
      error: '加载测验时出错',
      explanation: '解释',
      correct: '正确！',
      incorrect: '错误',
    },
    common: {
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      save: '保存',
      cancel: '取消',
      close: '关闭',
      success: '成功',
      warning: '警告',
      info: '信息',
    },
    offline: {
      status: '您已离线',
      limited: '可用功能受限',
      sync: '在线时同步',
    },
  },
};

export default translations;