package model

type JoinRequest struct {
	Nickname string `json:"nickname"`
	Color    string `json:"color"`
}

type JoinResponse struct {
	Code      int       `json:"code"`
	Result    string    `json:"result"`
	GameWorld GameWorld `json:"game_world"`
}
