# Build Dashboard
optuna-dashboard sqlite:///$HOME/test.db 

# Build the TS files in the project
npm run build:dev

# The TS files will be automatically built until ctrl-C is pressed
npm run watch

# Linter
npm run lint

# Formatter
npm run fmt

# First things to prepare
1. packages.json
2. tsconfig.json
3. .eslintrc.js
4. prettiterrc

# Failures I faced in the initial time
1. `tsconfig.json` does not exist
2. `compilerOptions` in `tsconfig.json` does not have `{"jsx": "react-jsx"}`

