# buddy - Tick, Tick... Boom!

### _Try not to blow this tower apart_

## Level 4

_Your ears become more in tune with the surroundings. Listen to find enemies and captives!_

> **TIP:** Use `warrior.listen()` to find spaces with other units, and `warrior.directionOf()` to determine what direction they're in.

### Floor Map

```
╔════╗
║C s ║
║ @ S║
║C s>║
╚════╝

C = Captive (1 HP)
s = Sludge (12 HP)
@ = buddy (20 HP)
S = Thick Sludge (24 HP)
> = stairs
```

## Abilities

### Actions (only one per turn)

- `warrior.attack()`: Attacks a unit in the given direction (`'forward'` by default), dealing 5 HP of damage.
- `warrior.bind()`: Binds a unit in the given direction (`'forward'` by default) to keep him from moving.
- `warrior.rescue()`: Releases a unit from his chains in the given direction (`'forward'` by default).
- `warrior.rest()`: Gains 10% of max health back, but does nothing more.
- `warrior.walk()`: Moves one space in the given direction (`'forward'` by default).

### Senses

- `warrior.maxHealth()`: Returns an integer representing your maximum health.
- `warrior.directionOfStairs()`: Returns the direction (forward, right, backward or left) the stairs are from your location.
- `warrior.directionOf()`: Returns the direction (forward, right, backward or left) to the given space.
- `warrior.feel()`: Returns the adjacent space in the given direction (`'forward'` by default).
- `warrior.health()`: Returns an integer representing your health.
- `warrior.listen()`: Returns an array of all spaces which have units in them (excluding yourself).
- `warrior.think()`: Thinks out loud (`console.log` replacement).

## Next Steps

When you're done editing `Player.js`, run the `warriorjs` command again.
