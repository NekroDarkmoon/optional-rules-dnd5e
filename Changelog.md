# Changelog

### V0.2.4 - Flanking
**Flanking Changes**
- Flanking now only applies to melee weapon attacks.
- Flanking is no longer checked for creatures of the same disposition.
- Flanking now checks for adjacency.
- Flanking condition will now be removed when player untargets a creature that is being flanked.

**Setting Changes**
- Revamped settings into a tidier menu with tabs for each rule.
- Added hints to all settings for a better explanation of each setting.
- Added better checks for out of bounds settings.


### V0.2.2 - Flanking
- Added support for modifiers instead of advantage.

### V0.2.0 - Flanking
- Added automation for the official Flanking rules found in the dmg.

Flanking is checked when a token is targeted, and if the token is being flanked advantage on the next attack roll is applied. The advantage is removed if the token moves from its original location at which point the token must be targeted again to check for flanking. 


### V0.1.0 - Hero Points 
- Added automation for the Hero points optional rule. 
Hero Points should presist even on deleting an actor and recreating it, as long as the actor has the same name and the world isn't refreshed by the DM.

[Warning] Hero Points consumes the teritary resource on char sheets so any existing data will be lost.

Currently hero points are rolled when the value for the tertiary resource is changed.

On level-up GM needs to refresh for hero points to update.


### V0.0.7
- Added the option to set the threshold to trigger the critical-hit-fumble rolltables. Default value is 5, max is 6, and min is 1.

### V-0.0.5
- Fixed module.json

### V-0.0.4
- Updated Readme.

### V-0.0.3
- Proficiency Die is now compatible with DAE, though the output for saves is a bit messy.
- Added required depedency for LibWrapper. 

### V-0.0.2
- Added settings for the hero points feature for future development.
- Added support for Proficiency Die Rules. (Currently conflicts with DAE).