package main

import (
	"github.com/donbattery/bnj2/server/game"
)

func main() {
	g := game.New()
	g.SpawnBouncer()
	g.Run()
}
