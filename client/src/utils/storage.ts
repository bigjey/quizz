const PLAYER_NAME_KEY = "player_name"
const PLAYER_ID_KEY = "player_id"

export const getPlayerName = (): string | null => {
  return localStorage.getItem(PLAYER_NAME_KEY)
}

export const setPlayerName = (value: string) => {
  localStorage.setItem(PLAYER_NAME_KEY, value)
}

export const getPlayerId = (): string | null => {
  let pId = localStorage.getItem(PLAYER_ID_KEY)

  if (!pId) {
    pId = Math.random()
      .toString()
      .slice(2, 10)
    setPlayerId(pId)
  }

  return pId
}

export const setPlayerId = (value: string) => {
  localStorage.setItem(PLAYER_ID_KEY, value)
}
