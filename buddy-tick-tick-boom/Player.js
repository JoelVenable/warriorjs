class Player {
  constructor() {
    // Persistent variables go here.
    Player.hp = [20]; // array that tracks HP each turn
    Player.turn = 0; // tracks the current turn
    Player.foundCorner = false;
    Player.recoverMode = false;
    Player.backupCounter = 0;
    Player.x = [0];
    Player.y = [0];
    Player.cornerXY = [0, 0]; // gets updated when the corner is found.
    Player.facing = 1; // assumption
    Player.foundStairs = false;
    Player.hasTrue = function (arr) {
      try {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]) return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }
  }

  updateHeading(warrior, action, compass) {
    if (action.do != 'pivot') return false;
    // action.newHeading to be used only when turning.  
    var i = Player.facing;
    switch (action.newHeading) {
      case 1:
        return false; // no change required.
      case 2:
        i++;
        break;
      case 3:
        i--; // lack of 'break' is deliberate.
      case 0:
        i--;
    }
    Player.facing = (i + 4) % 4;
    warrior.think("I'm now facing " + compass[Player.facing]);
  }

  isTakingDamage(warrior) {
    try {
      Player.hp[Player.turn] = warrior.health();
      var thisTurn = Player.hp[Player.turn],
        lastTurn = Player.hp[Player.turn - 1];
      warrior.think('My health this turn is ' + thisTurn + ", last turn was " + lastTurn);
      if (thisTurn < lastTurn) return true;
      else return false;
    } catch (e) {
      warrior.think("warrior.health() not available.");
      return false;
    }
  }

  rangeDamage(warrior, feel, isTakingDamage, action) {
    try {
      warrior.look();
      return action;
    } catch (e) {
      if (!feel || !isTakingDamage) return action; // passthrough to handle errors.  
      // do something
      if (isTakingDamage && !Player.hasTrue(feel.unit)) {
        // taking damage with no adjacent units.  
        action.do = 'walk';
        if (warrior.health() < 8) action.dir = 3;
        else action.dir = 1;
      }
    }
    return action;
  }

  heal(warrior, feel, quad, action, isTakingDamage) {
    try { // first test for method availability
      var health = warrior.health();
    } catch (e) {
      return action;
    }
    if (isTakingDamage && health < 8) {

      if (feel.unit.every(val => val == true)) {
        // I'm surrounded
        var captiveQuad = []
        for (let i = 0; i < 4; i++) {
          if (!warrior.feel(quad[i]).getUnit().isEnemy()) captiveQuad.push(i);
        }
        action.do = 'rescue';
        action.dir = captiveQuad;
      } else {
        action.do = 'walk';
        action.dir = feel.empty.filter(val => val == true);
      }
    } else if (!isTakingDamage && health < 17) {
      action.do = 'rest';
    }
    return action;
  }

  feelAround(warrior, quad) {
    var feel = {
      walls: undefined,
      stairs: undefined,
      empty: undefined,
      unit: undefined,
      enemy: undefined
    };
    try {
      feel.walls = quad.map(val => warrior.feel(val).isWall());
      feel.stairs = quad.map(val => warrior.feel(val).isStairs());
      feel.empty = quad.map(val => warrior.feel(val).isEmpty());
      feel.unit = quad.map(val => warrior.feel(val).isUnit());
      return feel;
    } catch (e) {
      warrior.think("feelAround: " + e);
      return false;
    }
    /*  feel has the following properties:
      feel.walls[0-3]
      feel.empty[0-3]
      feel.stairs[0-3]
      feel.unit[0-3]
      feel.enemy[0-3] // tested separately from others to handle level 2.

      All values of the array are true/false, just like the 
      'warrior.feel('left').isWall()' function.

      Note: if the warrior.feel() method is unavailable,
      'feel' is set to 'undefined'.
    */

  }

  updateXY(warrior, feel, action, turn) {
    // so far walking is the only way to move.
    // we also need feel() to know if the way is clear.
    if (!feel) return false; // If we can't feel() we won't know if we hit anyting

    // If not walking or if we walked into something...
    if (action.do != 'walk' || !feel.empty[action.dir]) {
      Player.x[turn] = Player.x[turn - 1];
      Player.y[turn] = Player.y[turn - 1];
      return false;
    }

    function mod2(num) {
      if (num % 2 == 0) return true;
      else return false;
    };
    var posX = Player.x[turn - 1],
      posY = Player.y[turn - 1];
    const face = Player.facing;

    if (mod2(face) && mod2(action.dir)) {
      if (action.dir == face) posX--;
      else posX++;
    } else if (mod2(face) && !mod2(action.dir)) {
      if (action.dir + face == 3) posY--;
      else posY++;
    } else if (!mod2(face) && mod2(action.dir)) {
      if (face + action.dir == 3) posY--;
      else posY++;
    } else if (!mod2(face) && !mod2(action.dir)) {
      if (face == action.dir) posX++;
      else posX--;
    }

    Player.x[turn] = posX;
    Player.y[turn] = posY;
    warrior.think(`I'm now at ${Player.x[turn]}, ${Player.y[turn]}`);
  }

  act(warrior, action, quad) {
    //  Assuming all errors have been handled here, except for
    //  the first level when warrior.walk() cannot handle directions.
    warrior.think(`is going to ${action.do} to the ${quad[action.dir]}`)

    try {
      switch (action.do) {
        case 'walk':
          try {
            warrior.walk(quad[action.dir]);
          } catch (e) {
            warrior.think(e);
            warrior.walk();
          }
          break;
        case 'shoot':
          warrior.shoot(quad[action.dir]);
          break;
        case 'attack':
          warrior.attack(quad[action.dir]);
          break;
        case 'bind':
          try {
            warrior.bind(quad[action.dir]);
          } catch (e) {
            warrior.think(e);
            warrior.attack(quad[action.dir]);
          }
        case 'pivot':
          try {
            warrior.pivot(quad[action.newHeading]);
          } catch (e) {
            warrior.walk(quad[3]); // walk backwards if we can't turn around
          }
          break;
        case 'rest':
          warrior.rest();
          break;
        case 'rescue':
          warrior.rescue(quad[action.dir]);
      }
    } catch (e) {}
  }

  navigate(warrior, feel, action, quad) {
    if (!feel) return action; // warrior.feel() failed...

    // need to find the corner (walls on three sides).

    try {
      try {
        unitArr = warrior.listen();








      } catch (e) {
        var dirStairs = quad.indexOf(warrior.directionOfStairs());

        action.dir = dirStairs;


      }
    } catch (e) {
      // if directionOfStairs() method introduced in tick-tick-boom is unavailable 
      switch (feel.walls.join(",")) {
        case "true,false,true,true":
          warrior.think("I've found a corner, facing the opening");
          Player.foundCorner = true;
          break;
        case "true,true,true,false":
          warrior.think("I'm in the corner facing the wall");
          action.do = 'pivot';
          action.newHeading = 3;
          Player.foundCorner = true;
          break;
        case "true,false,true,false":
          if (!Player.foundCorner) {
            warrior.think("I'm in the middle of a hallway");
            action.dir = 3; // 
            if (feel.stairs[3] || Player.foundStairs) {
              Player.foundStairs = true;
              action.dir = 1;
            }
          } else action.dir = 1;
      }

    }

    return action;
  }

  unitHandler(warrior, feel, quad, action) {
    // first handle errors...
    if (!feel) return action;
    if (!feel.unit && !feel.empty[action.dir]) {
      action.do = 'attack';
      return action;
    }

    // Next check if someone is around...
    if (Player.hasTrue(feel.unit)) {
      warrior.think("someone is around.");
      for (let i = 0; i < feel.unit.length; i++) {
        try {
          if (feel.unit[i]) {
            if (warrior.feel(quad[i]).getUnit().isEnemy()) {
              action.do = 'attack';
              action.dir = i;
            } else {
              if (action.do !== 'attack') { // attack is prioritized over rescue.
                action.do = 'rescue';
                action.dir = i;
              }
            }
          }
        } catch (e) {
          warrior.think(e);
          //  isEnemy() is not available.  Assuming enemy.
          return 'attack';
        }
      }
    }
    return action;
  }

  shootHandler(warrior, quad, action) {
    try {
      warrior.look(); // If we can't look, we can't shoot.
    } catch (e) {
      return action;
    }



    /* function firstUnit(els) {
       for (let index of els) {
         //if (els[index].isUnit()) return index;
         //else return false;
       }
     }  */
    var unitsQuad = [
      [],
      [],
      [],
      []
    ];
    var firstUnitQuad = [false, false, false, false];

    // Next check if someone is around...
    // look[dir].unit[dist]



    // find the first unit in each direction, then determine if friend or foe.
    for (let dir = 0; dir < 4; dir++) {
      unitsQuad[dir] = warrior.look(quad[dir]);
      for (let i = 0; i < unitsQuad[dir].length; i++) {
        if (unitsQuad[dir][i].isUnit() && firstUnitQuad[dir] === false) {
          firstUnitQuad[dir] = i; // Found the array index of thefirst unit on each quadrant.
        }
        if (firstUnitQuad[dir] !== false && unitsQuad[dir][firstUnitQuad[dir]].getUnit().isEnemy()) {
          action.do = 'shoot';
          action.dir = dir;
        }



      }
      //warrior.look(quad[dir]);  //  unitQuad is an array with up to 3 values



    }

    //firstUnitQuad[dir] = firstUnit(warrior.look(quad[dir]));

    //firstUnitQuad[dir] = firstUnit(look[dir].unit);
    //firstUnitQuad[dir] = look.unit[dir];
    //warrior.think(look.unit[dir][dir]);
    //warrior.think(`First Unit to: ${quad[dir]} is ${warrior.look(quad[dir])[1].isUnit()}`);
    //warrior.think(`Trying out firstUnitQuad: ${firstUni}`)



    /*
          for (let i = 0; i < feel.unit.length; i++) {
            try {
              if (feel.unit[i]) {
                if (warrior.feel(quad[i]).getUnit().isEnemy()) {
                  action.do = 'attack';
                  action.dir = i;
                } else {
                  if (action.do !== 'attack') { // attack is prioritized over rescue.
                    action.do = 'rescue';
                    action.dir = i;
                  }
                }
              }
            } catch (e) {
              warrior.think(e);
              //  isEnemy() is not available.  Assuming enemy.
              return 'attack';
            }
          }*/

    return action;
  }

  bindHandler(warrior, feel, quad, action) {
    // warrior.bind() is desired when multiple enemies are in range.  
    // this function sets action.do = 'bind' if it detects multiple
    // unbound enemies nearby.  The player.act function will catch the
    // resulting error if the bind() method is unavailable and fallback to
    // warrior.attack.  

    // Therefore we should make sure we don't try to bind a captive!
    if (!feel) return action;
    var enemyQuad = [];
    for (let i = 0; i < 4; i++) { // always checks all quadrants
      if (feel.unit[i]) {
        if (warrior.feel(quad[i]).getUnit().isEnemy()) {
          enemyQuad.push(i);
        }
      }
    }
    if (enemyQuad.length == 0) return action;
    else {
      for (let j = 0; j < enemyQuad.length; j++) {
        if (!warrior.feel(quad[enemyQuad[j]]).getUnit().isBound()) {
          warrior.think(`there's an unbound enemy to the ${quad[j]}`);
          action.do = 'bind';
          action.dir = enemyQuad[j];
        }
      }
    }
    return action;
  }





  playTurn(warrior) {
    Player.turn++;
    warrior.think("Turn: " + Player.turn);
    var action = {
      do: 'walk', // assumptions that begin the logic flow.
      dir: 1,
      newHeading: 1, // used for turning.
      unitDir: []
    };

    const quad = [
        'left',
        'forward',
        'right',
        'backward'
      ],
      compass = [ //  will use this later when two-dimensional maps begin to appear.
        'north',
        'east',
        'south',
        'west'
      ],
      takingDamage = this.isTakingDamage(warrior),
      feel = this.feelAround(warrior, quad);
    //look = this.lookAround(warrior, quad);
    warrior.think(warrior.directionOf(warrior.listen()[0]));




    // begin logic flow

    // default action is to walk forward.
    action = this.navigate(warrior, feel, action, quad);
    /* navigate() does: 
      1. checks for availability of feel()
      2. detects if player begins with walls on three sides
      3. if not it will back up until the wall is found.  
      4. If player is facing a wall, navigate will turn around (TODO).
    */


    action = this.unitHandler(warrior, feel, quad, action);
    /* unitHandler() does:
      1. checks for availability of feel()
      2. if !feel.enemy and !empty then attack (special case for level 2)
      2. determines if there are any units nearby (can detect multiple)
      3. determines if it can detect if the unit is friend or foe
      4. prioritizes attacking enemies over rescuing friendly units
      5. rescues captives.
    */

    action = this.shootHandler(warrior, quad, action);

    action = this.heal(warrior, feel, quad, action, takingDamage);
    /* heal() does: 
      1. checks for availability of warrior.health()

      



    */
    action = this.rangeDamage(warrior, feel, takingDamage, action);

    /* rangeDamage() does:
      1. checks for availability of feel() and health()
      cool stuff... (TODO)

    */

    action = this.bindHandler(warrior, feel, quad, action);

    this.act(warrior, action, quad);
    // act() executes the result of all the logic above. 
    // if walk('forward') causes error it will substitute with walk().
    this.updateXY(warrior, feel, action, Player.turn);
    // updateXY() will update the Player.x and Player.y properties 
    // to track the player's position
    this.updateHeading(warrior, action, compass);
    // updateHeading() tracks the direction the player is facing.
  }
}