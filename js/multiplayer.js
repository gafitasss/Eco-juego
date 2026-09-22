/* =========================================================
   ECO — MULTIJUGADOR
   ========================================================= */

const EcoMultiplayer = (() => {

  let connected = false;
  let gameId = null;

  const listeners = {};

  function on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }

    listeners[event].push(callback);
  }

  function emit(event, data) {
    if (!listeners[event]) {
      return;
    }

    listeners[event].forEach(callback => {
      callback(data);
    });
  }

  function setConnected(value) {
    connected = value;

    emit("connection", {
      connected
    });
  }

  function isConnected() {
    return connected;
  }

  function setGameId(id) {
    gameId = id;

    emit("game", {
      gameId
    });
  }

  function getGameId() {
    return gameId;
  }

  /*
   * Esta función será sustituida por la conexión
   * real con nuestro servidor.
   */
  async function connect() {

    const userId =
      TelegramECO.userId();

    if (!userId) {
      console.warn(
        "ECO: no se ha encontrado el usuario de Telegram."
      );
    }

    /*
     * De momento simulamos la conexión.
     * El siguiente servidor sustituirá esta parte.
     */

    setConnected(true);

    return {
      connected: true,
      userId
    };
  }

  async function submitChoice(choice) {

    if (!connected) {
      throw new Error(
        "No hay conexión con ECO."
      );
    }

    /*
     * IMPORTANTE:
     *
     * Aquí NO calculamos puntos.
     * Aquí NO modificamos el mundo.
     *
     * Solamente enviamos la decisión.
     */

    const payload = {
      gameId,
      userId: TelegramECO.userId(),
      choice,
      timestamp: Date.now()
    };

    console.log(
      "ECO → decisión enviada:",
      payload
    );

    emit("choiceSubmitted", payload);

    return {
      success: true
    };
  }

  function receiveWorldUpdate(data) {

    /*
     * El servidor enviará algo parecido a:
     *
     * {
     *   round: 4,
     *   players: 1284,
     *   energy: 68,
     *   trust: 51,
     *   chaos: 32,
     *   event: "LA GRIETA"
     * }
     */

    emit("worldUpdate", data);
  }

  function receiveRoundStart(data) {
    emit("roundStart", data);
  }

  function receiveRoundEnd(data) {
    emit("roundEnd", data);
  }

  return {
    on,
    connect,
    isConnected,
    getGameId,
    setGameId,
    submitChoice,
    receiveWorldUpdate,
    receiveRoundStart,
    receiveRoundEnd
  };

})();
