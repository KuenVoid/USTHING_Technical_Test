const fs = require("node:fs");
const path = require("node:path");
const duckdb = require("duckdb");

const root = path.resolve(__dirname, "..");
const database = path.join(root, "data", "database");
const output = path.join(root, "src", "data", "local-data.json");
const db = new duckdb.Database(":memory:");

function all(query) {
  return new Promise((resolve, reject) =>
    db.all(query, (error, rows) => (error ? reject(error) : resolve(rows))),
  );
}

async function main() {
  const [{ max_term: maxTerm }] = await all(
    `select max(term_num) as max_term from read_parquet('${database}/course_records.parquet')`,
  );
  const courses = await all(
    `with ranked as (select *, row_number() over (partition by term_num, id order by timestamp desc nulls last) as record_rank from read_parquet('${database}/course_records.parquet') where term_num = ${maxTerm}) select term_num, term_code, term_name, id, prefix, number, career, title, credits, prerequisite, status from ranked where record_rank = 1 and status = 'ACTIVE' order by prefix, number`,
  );
  const classes = await all(
    `with ranked as (select *, row_number() over (partition by term_num, course_id, section order by timestamp desc nulls last) as record_rank from read_parquet('${database}/class_records.parquet') where term_num = ${maxTerm}) select term_num, term_code, term_name, course_id, prefix, course_number, course_code, section, number, capacity, enroll, wait, schedules, reservations, status from ranked where record_rank = 1 and status = 'ACTIVE' order by course_code, section`,
  );
  const prefixes = [
    ...new Set(courses.map((course) => course.prefix).filter(Boolean)),
  ];
  const semesters = [
    ...new Set(courses.map((course) => course.term_name).filter(Boolean)),
  ];
  fs.writeFileSync(
    output,
    JSON.stringify({ courses, classes, prefixes, semesters }),
  );
  console.log(
    `Wrote ${courses.length} courses and ${classes.length} classes for term ${maxTerm} to ${output}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
