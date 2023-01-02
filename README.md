# DAML App Template

## Overview

This repository contains a prototype of supplychain project build in DAML. spefically for pineapple juice production supplychain it help track apple juice from farm( fruit de base) to warehouse, this project can be extended to other supplychain project as is configurable. Customers can all information by just scanning Qr code. this projet is base on DAML simple UI template. The template is based on [create-react-app](https://github.com/facebook/create-react-app) and the [Material UI](https://material-ui.com/) framework.

## Prerequisites

* [Yarn](https://yarnpkg.com/lang/en/docs/install/)
* [DAML SDK](https://docs.daml.com/getting-started/installation.html)

## Running the app

1. Start the sandbox ledger
```
daml start
```

Wait until the ledger has started up.

2. In a new shell, start the UI
```
cd ui
yarn install --force --frozen-lockfile
yarn start
```

This opens a browser page pointing to `http://localhost:3000/#/login`. Note that the development server serves content via http and should not be exposed as is to a public-facing network.

If you change the Daml code you need to rerun all of the steps above in order for the changes to propagate properly into the UI code.

Note that in order to support login with party aliases (like "Business Owner") we output a `[(Text, Party)]` mapping from the init script. This output file (`ui/parties.json`) is used to map party aliases to party ids.
For this to work the ledger has to have completed the init script before starting up the UI server. This is of course only a convenience practice and should not be used in production.

## Exploring the application

https://drive.google.com/file/d/137WaL7urQi3-e_B5UJByLiamM1THFFui/view?usp=share_link (page 34 -40 )