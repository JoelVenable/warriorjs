# Warrior.js playthrough

You may or may not be aware of the warrior.js game by olistic, but it serves as an excellent way to practice skills in programming Javascript.  Personally, I have been going through the YouDontKnowJS online books, and found myself in need of actual programs to practice my learning, which is crucial for developing book learning into an actual skill.

When I began coding to beat this rudimentary game, I decided to build robust features instead of doing the bare minimum to beat a particular level. I also wanted to use ES6 syntax to be in keeping with modern development standards.  As such, I created some `map` functions as well as `=>` anonymous functions where appropriate.  

## Code Philosophy

In order to progress through the levels on an initial playthrough without touching the code, robust error handling methods are needed, since there are many actions available in later levels that are not exposed on initial playthrough.  In fact, on level one of the 'baby steps' tower, `warrior.walk()` cannot even accept a direction as an argument.  To combat this issue, I used `try ... catch` extensively throughout the codebase to ensure graceful failure with fallback actions.

Another useful feature of the game is that some actions are effectively "free" and others are expensive.  For example, `warrior.look()` and `warrior.feel()` when available can be performed an infinite amount of times per turn.  Therefore I am writing many utilities to make use of those functions to ensure that a more expensive mistake is not made (walking into a wall or an enemy unit is a good example).
