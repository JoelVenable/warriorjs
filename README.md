# Warrior.js playthrough

You may or may not be aware of the warrior.js game by olistic, but it serves as an excellent way to practice skills in programming Javascript.  Personally, I have been going through the YouDontKnowJS online books, and found myself in need of actual programs to practice my learning, which is crucial for developing book learning into an actual skill.

When I began coding to beat this rudimentary game, I decided to build robust features instead of doing the bare minimum to beat a particular level. I also wanted to use ES6 syntax to be in keeping with modern development standards.  As such, I created some `map` functions as well as `=>` anonymous functions where appropriate.  

## Code Philosophy

In order to progress through the levels on an initial playthrough without touching the code, robust error handling methods are needed, since there are many actions available in later levels that are not exposed on initial playthrough.  In fact, on level one, `Warrior.walk()` cannot even accept a direction as an argument.  To combat this issue, I used `try { } catch (error) { }` extensively throughout the file.
