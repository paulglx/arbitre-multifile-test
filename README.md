# 🛠️ Arbitre Multifile Tester

This is a glorified file uploader that sends files to [Judge0](https://github.com/judge0/judge0) for testing. The goal is to build and try out test suites for [Arbitre](https://github.com/paulglx/arbitre).

## Features

Load up any amount of files. The app processes the files and sends them to Judge0 for testing. The results are displayed in a table.

## Usage

```bash
# First time
npm install

# Start the app
npm run start
```

## Requirements

- `npm`
- Judge0

### Installation

#### Node.js

`npm` is included with Node.js.
[Download Node.js](https://nodejs.org/en/download/)

#### Judge0

This project requires a local instance of Judge0.  The recommended way to install Judge0 is to use the provided Docker image. [Instructions here.](https://github.com/judge0/judge0/blob/master/CHANGELOG.md#deployment-procedure)

## Credits

Built for the [Arbitre](https://github.com/paulglx/arbitre) code correction platform at [Télécom SudParis](https://www.telecom-sudparis.eu/en/).