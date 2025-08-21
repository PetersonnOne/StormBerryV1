const translations = {
  education: {
    title: 'Bildungsmodul',
    input: {
      text: {
        label: 'Frage stellen',
        placeholder: 'Geben Sie Ihre Frage hier ein...',
        submit: 'Absenden',
        error: 'Bitte geben Sie eine gültige Frage ein',
      },
      voice: {
        start: 'Aufnahme starten',
        stop: 'Aufnahme beenden',
        processing: 'Verarbeite Ihre Stimme...',
        error: 'Fehler bei der Verarbeitung der Spracheingabe',
        permission: 'Bitte erlauben Sie den Zugriff auf das Mikrofon',
      },
      image: {
        select: 'Bild auswählen',
        upload: 'Hochladen',
        processing: 'Verarbeite Bild...',
        error: 'Fehler beim Hochladen des Bildes',
        format: 'Unterstützte Formate: JPG, PNG, GIF',
        size: 'Maximale Dateigröße: 5MB',
      },
    },
    lesson: {
      loading: 'Lade Lektion...',
      error: 'Fehler beim Laden der Lektion',
      next: 'Weiter',
      previous: 'Zurück',
      complete: 'Lektion abschließen',
      progress: 'Fortschritt: {{completed}}/{{total}}',
    },
    quiz: {
      title: 'Quiz',
      start: 'Quiz starten',
      next: 'Nächste Frage',
      submit: 'Antwort absenden',
      result: 'Quiz-Ergebnis',
      score: 'Ihr Ergebnis: {{score}}/{{total}}',
      retry: 'Erneut versuchen',
      loading: 'Lade Quiz...',
      error: 'Fehler beim Laden des Quiz',
      explanation: 'Erklärung',
      correct: 'Richtig!',
      incorrect: 'Falsch',
    },
    common: {
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      retry: 'Wiederholen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schließen',
      success: 'Erfolg',
      warning: 'Warnung',
      info: 'Information',
    },
    offline: {
      status: 'Sie sind offline',
      limited: 'Eingeschränkte Funktionalität verfügbar',
      sync: 'Synchronisieren wenn online',
    },
  },
};

export default translations;