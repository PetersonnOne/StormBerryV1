const translations = {
  education: {
    title: 'Module d\'Éducation',
    input: {
      text: {
        label: 'Poser une Question',
        placeholder: 'Tapez votre question ici...',
        submit: 'Envoyer',
        error: 'Veuillez entrer une question valide',
      },
      voice: {
        start: 'Démarrer l\'Enregistrement',
        stop: 'Arrêter l\'Enregistrement',
        processing: 'Traitement de votre voix...',
        error: 'Erreur lors du traitement de l\'entrée vocale',
        permission: 'Veuillez autoriser l\'accès au microphone',
      },
      image: {
        select: 'Sélectionner une Image',
        upload: 'Télécharger',
        processing: 'Traitement de l\'image...',
        error: 'Erreur lors du téléchargement de l\'image',
        format: 'Formats supportés : JPG, PNG, GIF',
        size: 'Taille maximale du fichier : 5MB',
      },
    },
    lesson: {
      loading: 'Chargement de la leçon...',
      error: 'Erreur lors du chargement de la leçon',
      next: 'Suivant',
      previous: 'Précédent',
      complete: 'Terminer la Leçon',
      progress: 'Progression : {{completed}}/{{total}}',
    },
    quiz: {
      title: 'Quiz',
      start: 'Commencer le Quiz',
      next: 'Question Suivante',
      submit: 'Soumettre la Réponse',
      result: 'Résultat du Quiz',
      score: 'Votre Score : {{score}}/{{total}}',
      retry: 'Réessayer',
      loading: 'Chargement du quiz...',
      error: 'Erreur lors du chargement du quiz',
      explanation: 'Explication',
      correct: 'Correct !',
      incorrect: 'Incorrect',
    },
    common: {
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      retry: 'Réessayer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
    },
    offline: {
      status: 'Vous êtes hors ligne',
      limited: 'Fonctionnalités limitées disponibles',
      sync: 'Synchroniser une fois en ligne',
    },
  },
};

export default translations;