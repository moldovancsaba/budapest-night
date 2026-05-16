#!/usr/bin/env node
const assert = require("assert");
const { validateProviderLocationForIngest } = require("./location-ingest-validate.cjs");

function testMomCafeRejectsInfopark() {
  const errors = validateProviderLocationForIngest(
    {
      id: "prov-cov-cafe-mom-infopark",
      borough: "Újbuda",
      neighborhood: "Infopark",
      address: "1124 Budapest, Csörsz utca 18, Hungary",
      shortDescription: "Coffee in Infopark",
      longDescription: "Sources: https://momkult.hu/",
    },
    "test",
  );
  assert.ok(errors.some((e) => e.includes("borough")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("neighborhood") || e.includes("Infopark")), errors.join("\n"));
}

function testMomCafeAcceptsRegistry() {
  const errors = validateProviderLocationForIngest(
    {
      id: "prov-cov-cafe-mom-infopark",
      borough: "Buda",
      neighborhood: "MOM Park",
      address: "1124 Budapest, Csörsz utca 18, Hungary",
      longDescription: "Café at MOM. Sources: https://momkult.hu/",
    },
    "test",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
}

function testUnknownPostalRejected() {
  const errors = validateProviderLocationForIngest(
    {
      id: "prov-test-x",
      borough: "Buda",
      neighborhood: "MOM Park",
      address: "1999 Budapest, Fake utca 1, Hungary",
    },
    "test",
  );
  assert.ok(errors.some((e) => e.includes("1999")), errors.join("\n"));
}

testMomCafeRejectsInfopark();
testMomCafeAcceptsRegistry();
testUnknownPostalRejected();
console.log("location-ingest-validate.test.cjs: ok");
