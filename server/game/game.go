package game

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/donbattery/bnj2/server/model"

	"github.com/lonng/nano"
	"github.com/lonng/nano/component"
	"github.com/lonng/nano/scheduler"
	"github.com/lonng/nano/serialize/json"
	"github.com/lonng/nano/session"
	"github.com/solarlune/resolv"
)

const (
	roomKey = "roomKey"
	gameKey = "gameKey"
)

type Game struct {
	component.Base
	statusTimer *scheduler.Timer
	updateTimer *scheduler.Timer

	room *nano.Group

	space *resolv.Space

	bouncers []*Bouncer

	players map[int64]*model.Player
}

type Bouncer struct {
	Object         *resolv.Object
	SpeedX, SpeedY float64
}

func New() *Game {
	width := 320
	height := 200
	cellSize := 20

	space := resolv.NewSpace(width, height, cellSize, cellSize)

	geometry := []*resolv.Object{
		resolv.NewObject(0, 0, 16, float64(height)),
		resolv.NewObject(float64(width)-16, 0, 16, float64(height)),
		resolv.NewObject(0, 0, float64(width), 16),
		resolv.NewObject(0, float64(height)-24, float64(width), 32),
	}

	space.Add(geometry...)

	return &Game{
		room:     nano.NewGroup("game-room"),
		space:    space,
		bouncers: []*Bouncer{},
		players:  make(map[int64]*model.Player),
	}
}

func (game *Game) SpawnBouncer() {

	bouncer := &Bouncer{
		Object: resolv.NewObject(0, 0, 2, 2),
		SpeedX: (rand.Float64() * 8) - 4,
		SpeedY: (rand.Float64() * 8) - 4,
	}

	game.space.Add(bouncer.Object)

	// Choose an unoccupied cell to spawn a bouncing object in
	var c *resolv.Cell
	for c == nil {
		rx := rand.Intn(game.space.Width())
		ry := rand.Intn(game.space.Height())
		c = game.space.Cell(rx, ry)
		if c.Occupied() {
			c = nil
		} else {
			bouncer.Object.X, bouncer.Object.Y = game.space.SpaceToWorld(c.X, c.Y)
		}
	}

	game.bouncers = append(game.bouncers, bouncer)
}

func (game *Game) Update() {
	for _, b := range game.bouncers {

		b.SpeedY += 0.1

		dx := b.SpeedX
		dy := b.SpeedY

		if check := b.Object.Check(dx, 0); check != nil {
			// We move a bouncer into contact with the owning cell rather than the object because we don't need to be that specific and
			// moving into contact with another moving object that bounces away can get them both stuck; it's easier to bounce off of the
			// "containing" cells, which are static.
			contact := check.ContactWithCell(check.Cells[0])
			dx = contact.X()
			b.SpeedX *= -1
		}

		b.Object.X += dx

		if check := b.Object.Check(0, dy); check != nil {
			contact := check.ContactWithCell(check.Cells[0])
			dy = contact.Y()
			b.SpeedY *= -1
		}

		b.Object.Y += dy

		b.Object.Update()

	}

}

func (game *Game) Dump() *model.GameStateUpdate {
	state := &model.GameStateUpdate{
		Objects: []model.GameObject{},
	}

	for _, obj := range game.space.Objects() {
		state.Objects = append(state.Objects, model.GameObject{
			X:          int(obj.X),
			Y:          int(obj.Y),
			ObjectType: 1,
			Animation:  0,
		})
	}

	return state
}

// AfterInit component lifetime callback
func (game *Game) AfterInit() {
	session.Lifetime.OnClosed(func(sess *session.Session) {
		if !sess.HasKey(roomKey) {
			return
		}

		delete(game.players, sess.ID())

		room := sess.Value(roomKey).(*nano.Group)
		room.Leave(sess)
	})
	game.statusTimer = scheduler.NewTimer(time.Second*5, func() {
		fmt.Printf("%s UserCount: %d\n", time.Now().Format("2006/01/02 15:04:05"), game.room.Count())
	})
	game.updateTimer = scheduler.NewTimer(time.Second/30, func() {
		game.Update()
		game.room.Broadcast("GameUpdate", game.Dump())
	})
}

func (game *Game) PlayerList() (playerList []model.Player) {
	for _, player := range game.players {
		playerList = append(playerList, *player)
	}
	return playerList
}

// Join room
func (game *Game) Join(sess *session.Session, req *model.JoinRequest) error {
	fmt.Printf("New join request with message: %s\n", req.Nickname)

	player := &model.Player{
		Name:  req.Nickname,
		Color: req.Color,
	}

	game.players[sess.ID()] = player

	sess.Bind(sess.ID())
	sess.Set(roomKey, game.room)
	sess.Set(gameKey, game)

	game.room.Add(sess) // add session to group
	return sess.Response(&model.JoinResponse{
		Code:   http.StatusOK,
		Result: "success",
		GameWorld: model.GameWorld{
			WorldRules: model.WorldRules{
				BlockSize:   20,
				MaxPlayer:   10,
				MinPlayer:   2,
				TargetScore: 99,
				WaitTime:    60,
				Gravity:     0.9,
				Friction:    0.1,
			},
			WorldMap: model.DefaultWorldMap(),
			Players:  game.PlayerList(),
		},
	})
}

func (game *Game) Run() {
	components := &component.Components{}
	components.Register(game)

	log.SetFlags(log.LstdFlags | log.Llongfile)

	nano.Listen(":9090",
		nano.WithIsWebsocket(true),
		nano.WithCheckOriginFunc(func(_ *http.Request) bool { return true }),
		nano.WithWSPath("/ws"),
		nano.WithDebugMode(),
		nano.WithSerializer(json.NewSerializer()), // override default serializer
		nano.WithComponents(components),
		nano.WithTimerPrecision(time.Second/60),
	)
}
