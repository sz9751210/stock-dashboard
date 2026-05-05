import test from "node:test";
import assert from "node:assert/strict";

import { topics } from "../src/data.js";

test("topics include expanded original-site supply-chain coverage", () => {
  const topicIds = new Set(topics.map((topic) => topic.id));

  for (const id of [
    "hpc-network-ic",
    "hbm-memory",
    "silicon-photonics-cpo",
    "connector-highspeed",
    "bbu-backup",
    "semiconductor-equipment",
    "wafer-materials",
    "cybersecurity-services",
  ]) {
    assert.equal(topicIds.has(id), true, `${id} should exist`);
  }
});

test("expanded topics provide enough company rows for analysis and twstock tracking", () => {
  const expandedTopics = topics.filter((topic) =>
    [
      "hpc-network-ic",
      "hbm-memory",
      "silicon-photonics-cpo",
      "connector-highspeed",
      "bbu-backup",
      "semiconductor-equipment",
      "wafer-materials",
      "cybersecurity-services",
    ].includes(topic.id),
  );

  assert.equal(expandedTopics.length, 8);
  assert.ok(expandedTopics.every((topic) => topic.companies.length >= 4));
});
