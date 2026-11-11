import fs from "fs";
import path from "path";
import { DatabaseState } from "./types";
import { INITIAL_DB_STATE } from "./initial-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE_PATH = path.join(DATA_DIR, "vitalsur-db.json");

export function readDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(
        DB_FILE_PATH,
        JSON.stringify(INITIAL_DB_STATE, null, 2),
        "utf-8"
      );
      return INITIAL_DB_STATE;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseState;
    return parsed;
  } catch {
    return INITIAL_DB_STATE;
  }
}

export function writeDatabase(nextState: DatabaseState): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(nextState, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
  return nextState;
}

