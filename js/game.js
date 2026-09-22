/* =========================================================
   ECO — MOTOR DEL JUEGO
   ========================================================= */

const ECO = (() => {

  const state = {
    round: 1,
    maxRounds: 5,

    energy: 64,
    trust: 52,
    chaos: 31,

    score: 0,

    selected: null,

    world: "La ciudad despierta"
  };

  const rounds = [
    {
      title: "La ciudad despierta",

      description:
        "Algo ha cambiado durante la noche. " +
        "Nadie sabe todavía quién lo provocó.",

      question:
        "La ciudad encuentra una fuente de energía desconocida. ¿Qué haces?",

      choices: [
        {
          name: "Absorberla",
          info: "Mucho poder, pero nadie conoce el precio.",
          type: "energy"
        },
        {
          name: "Estudiarla",
          info: "Intentas comprenderla antes de actuar.",
          type: "trust"
        },
        {
          name: "Destruirla",
          info: "Eliminas el riesgo antes de que crezca.",
          type: "chaos"
        }
      ]
    },

    {
      title: "La señal",

      description:
        "Miles de dispositivos reciben exactamente " +
        "el mismo mensaje.",

      question:
        "Una voz desconocida pide una respuesta. ¿Cómo reaccionas?",

      choices: [
        {
          name: "Responder",
          info: "Quizá haya alguien al otro lado.",
          type: "trust"
        },
        {
          name: "Rastrearla",
          info: "Intentas descubrir su origen.",
          type: "energy"
        },
        {
          name: "Ignorarla",
          info: "No vas a jugar según sus reglas.",
          type: "chaos"
        }
      ]
    },

    {
      title: "La multitud",

      description:
        "Una parte de la población empieza a actuar " +
        "de manera extraña.",

      question:
        "¿Qué haces con la información que tienes?",

      choices: [
        {
          name: "Compartirla",
          info: "Todos merecen saberlo.",
          type: "trust"
        },
        {
          name: "Ocultarla",
          info: "El pánico podría ser peor.",
          type: "energy"
        },
        {
          name: "Manipularla",
          info: "Puedes convertir el caos en ventaja.",
          type: "chaos"
        }
      ]
    },

    {
      title: "La grieta",

      description:
        "Aparece una anomalía que parece reaccionar " +
        "a las decisiones del grupo.",

      question:
        "La anomalía está creciendo. ¿Cuál es tu movimiento?",

      choices: [
        {
          name: "Acercarte",
          info: "Quieres descubrir qué hay dentro.",
          type: "energy"
        },
        {
          name: "Esperar",
          info: "Observas cómo evoluciona.",
          type: "trust"
        },
        {
          name: "Provocarla",
          info: "Quieres comprobar hasta dónde llega.",
          type: "chaos"
        }
      ]
    },

    {
      title: "El último eco",

      description:
        "Todo lo ocurrido parece formar parte de un mismo patrón.",

      question:
        "Tienes una última oportunidad para cambiar " +
        "el destino de la ciudad.",

      choices: [
        {
          name: "Salvarla",
          info: "El futuro del grupo está por encima de ti.",
          type: "trust"
        },
        {
          name: "Controlarla",
          info: "Si la controlas, controlas el futuro.",
          type: "energy"
        },
        {
          name: "Romperlo todo",
          info: "Quizá el mundo necesite empezar de cero.",
          type: "chaos"
        }
      ]
    }
  ];


  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }


  function getState() {
    return {
      ...state,
      selected: state.selected
        ? { ...state.selected }
        : null
    };
  }


  function getRound() {
    return rounds[state.round - 1];
  }


  function selectChoice(index) {

    const round = getRound();

    if (!round) {
      return null;
    }

    const choice = round.choices[index];

    if (!choice) {
      return null;
    }

    state.selected = {
      index,
      name: choice.name,
      type: choice.type
    };

    return getState();
  }


  function resolveChoice() {

    if (!state.selected) {
      return null;
    }

    const type = state.selected.type;

    const changes = {
      energy: 0,
      trust: 0,
      chaos: 0
    };

    let points = 0;

    if (type === "energy") {

      changes.energy += 12;
      changes.chaos += 7;

      points = 15;
    }

    if (type === "trust") {

      changes.trust += 12;
      changes.energy -= 4;

      points = 12;
    }

    if (type === "chaos") {

      changes.chaos -= 12;
      changes.energy -= 7;

      points = 18;
    }

    state.energy =
      clamp(state.energy + changes.energy);

    state.trust =
      clamp(state.trust + changes.trust);

    state.chaos =
      clamp(state.chaos + changes.chaos);

    state.score += points;

    const events = [];

    if (state.chaos >= 70) {

      events.push(
        "⚠️ El exceso de caos provoca una reacción inesperada."
      );

      state.energy =
        clamp(state.energy - 8);
    }

    if (state.trust >= 75) {

      events.push(
        "🤝 La población empieza a colaborar espontáneamente."
      );

      state.energy =
        clamp(state.energy + 6);
    }

    if (state.energy <= 20) {

      events.push(
        "🔋 La ciudad entra en modo de emergencia."
      );

      state.trust =
        clamp(state.trust - 6);
    }

    if (events.length === 0) {

      const randomEvents = [
        "👁️ Alguien observa tus decisiones desde las sombras.",
        "📡 Una señal desconocida acaba de aparecer.",
        "🌀 Algo ha cambiado, pero nadie sabe exactamente qué.",
        "🧩 Una pieza del misterio acaba de encajar.",
        "🎭 El grupo no es consciente de todas las consecuencias."
      ];

      events.push(
        randomEvents[
          Math.floor(
            Math.random() * randomEvents.length
          )
        ]
      );
    }

    const result = {
      choice: state.selected.name,
      type,
      points,
      changes,
      events,
      state: getState()
    };

    state.selected = null;

    return result;
  }


  function nextRound() {

    if (state.round >= state.maxRounds) {
      return false;
    }

    state.round++;

    return true;
  }


  function finish() {

    if (state.chaos >= 70) {

      return {
        title: "🔥 EL MUNDO SE ROMPIÓ",
        description:
          "El caos ha superado todos los límites."
      };

    }

    if (state.energy >= 75) {

      return {
        title: "⚡ LA CIUDAD ASCENDIÓ",
        description:
          "La humanidad ha aprendido a controlar la energía."
      };

    }

    if (state.trust >= 70) {

      return {
        title: "🤝 LA HUMANIDAD SOBREVIVIÓ",
        description:
          "La cooperación cambió el destino."
      };

    }

    return {
      title: "🌀 NADIE SABE QUÉ HA PASADO",
      description:
        "El ECO continúa..."
    };
  }


  function reset() {

    state.round = 1;

    state.energy = 64;
    state.trust = 52;
    state.chaos = 31;

    state.score = 0;

    state.selected = null;
  }


  return {

    getState,
    getRound,
    selectChoice,
    resolveChoice,
    nextRound,
    finish,
    reset

  };

})();
