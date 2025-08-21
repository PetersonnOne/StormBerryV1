const translations = {
  education: {
    title: 'Módulo de Educación',
    input: {
      text: {
        label: 'Hacer una Pregunta',
        placeholder: 'Escribe tu pregunta aquí...',
        submit: 'Enviar',
        error: 'Por favor, ingresa una pregunta válida',
      },
      voice: {
        start: 'Iniciar Grabación',
        stop: 'Detener Grabación',
        processing: 'Procesando tu voz...',
        error: 'Error al procesar entrada de voz',
        permission: 'Por favor, concede permiso para el micrófono',
      },
      image: {
        select: 'Seleccionar Imagen',
        upload: 'Subir',
        processing: 'Procesando imagen...',
        error: 'Error al subir imagen',
        format: 'Formatos soportados: JPG, PNG, GIF',
        size: 'Tamaño máximo de archivo: 5MB',
      },
    },
    lesson: {
      loading: 'Cargando lección...',
      error: 'Error al cargar lección',
      next: 'Siguiente',
      previous: 'Anterior',
      complete: 'Completar Lección',
      progress: 'Progreso: {{completed}}/{{total}}',
    },
    quiz: {
      title: 'Cuestionario',
      start: 'Comenzar Cuestionario',
      next: 'Siguiente Pregunta',
      submit: 'Enviar Respuesta',
      result: 'Resultado del Cuestionario',
      score: 'Tu Puntuación: {{score}}/{{total}}',
      retry: 'Intentar de Nuevo',
      loading: 'Cargando cuestionario...',
      error: 'Error al cargar cuestionario',
      explanation: 'Explicación',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
    },
    common: {
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      retry: 'Reintentar',
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
    },
    offline: {
      status: 'Estás desconectado',
      limited: 'Funcionalidad limitada disponible',
      sync: 'Sincronizar cuando estés en línea',
    },
  },
};

export default translations;