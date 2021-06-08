# Optional Rules for D&D5e

This module aims to automate some of the optional and homebrew rules avaialable for DnD 5e. A list of the supported rules are listed down below. Do note that you will still require the original source books to reference the full set of rules.


<sub>This module is created in compliance with WOTC's [fan content policy](https://company.wizards.com/en/legal/fancontentpolicy) </sub>

## Supported Rules
Below is a list of the current rules that the module automates.
- Critical hit and Fumble Rules (DMG).
- ProficiencyDie (DMG).


## Dependencies
Some of the optional rules depend on other modules. While it is not required to install all the dependencies, it's recommended to do so. Nonetheless, if you're only using certain rules, you can just install the dependecies for the particular rule.

- LibWrapper --> Required dependecies.
- Critical Hit and Fumble --> MidiQol.


## Installation Guide
Paste the following link in the install module section of foundry.
https://github.com/NekroDarkmoon/optional-rules-dnd5e/releases/latest/download/module.json


## Changelog

#### V0.0.7
- Added the option to set the threshold to trigger the critical-hit-fumble rolltables. Default value is 5, max is 6, and min is 1.

#### V-0.0.5
- Fixed module.json

#### V-0.0.4
- Updated Readme.

#### V-0.0.3
- Proficiency Die is now compatible with DAE, though the output for saves is a bit messy.
- Added required depedency for LibWrapper. 

#### V-0.0.2
- Added settings for the hero points feature for future development.
- Added support for Proficiency Die Rules. (Currently conflicts with DAE).