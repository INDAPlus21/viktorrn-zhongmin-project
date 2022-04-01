![](https://www.flightsafetyaustralia.com/wp-content/uploads/2015/07/CC1_f.jpg)
# Into the Storm

A game about flying planes into the eye of a storm. Be the first science team to gather enough data and get out of the zone.

The game can be played for free online at (website link), or you can build and host it yourself with instructions below for maximum stability and customization.

## How to play

The game is largely based on Ludo and similar board games, but with a unique board layout and real-time mechanics.

### The basic resource

Every (x) seconds the player can roll a new die. A player can hold up to 3 dice in their hand. Dice are spent similar to action points in order to move the player's airplanes.

### The Board

The board consists of 3 levels, the outer layer (*The Sky*) is 11 x 11 tiles, the middle layer (*The Storm*) is 7x7 tiles that houses moving debrie which can chrash planes and the inner layer (*The Eye*) is 3x3 tiles. Players *Runways* are located at each corner of *The Sky*, this is from where the players enter and exit the board.  

### How To Win

The goal of the game is to get three planes from their *Runsways* into *The Eye* and back. Inside *The Eye* there are *Data Points {working title}* 

## Building

If you prefer running the server on your own machine, it's very simple.

Begin by downloading the entire repository. Make sure [Node.js](https://nodejs.org/) is installed on the client that will host the server. Then, install the necessary packages with this command:
```
npm i express socket.io
```
Run the game with:
```
node index.js
```

